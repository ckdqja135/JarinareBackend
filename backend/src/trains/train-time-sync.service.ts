import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { AppConfigService } from "../config/app-config.service";
import { AppException } from "../common/errors/app.exception";
import { DbLockService } from "../common/lock/db-lock.service";
import { ErrorCode } from "../common/errors/error-code";
import { PrismaService } from "../prisma/prisma.service";
import { JobQueueService } from "../scheduler/job-queue.service";
import { TRAIN_ROUTES, TrainRoute } from "./constants/train-routes";
import { TrainTimeSyncRangeDto } from "./dto/train-time-sync.dto";
import { TrainsService } from "./trains.service";

export interface TrainTimeSyncResult {
  executed: boolean;
  routes: number;
  dates: string[];
  tasks: number;
  succeeded: number;
  failed: number;
}

const CRON_JOB_NAME = "train-time-sync";
const LOCK_NAME = "train-time-sync";
const LOCK_TTL_MS = 60 * 60 * 1000; // 60분 (노선 수가 커도 한 번의 실행을 보호)
const MAX_RANGE_DAYS = 31; // 수동 실행 시 허용 최대 기간 (외부 API 호출량 상한)

/**
 * 고정 노선(TRAIN_ROUTES)의 열차 시간표를 1주일치 미리 조회해 stations_times 에 저장하는 스케줄러.
 *  - 매일 새벽 자동 실행 (오늘 포함 N일, 슬라이딩)
 *  - 관리자가 기간을 선택해 수동 실행 (syncRange)
 *  - 분산 락으로 다중 인스턴스 / 자동·수동 중복 실행을 방지한다.
 *  - 노선×날짜 단위로 부분 실패를 허용한다(한 건 실패가 전체를 막지 않음).
 */
@Injectable()
export class TrainTimeSyncService implements OnModuleInit {
  private readonly logger = new Logger(TrainTimeSyncService.name);

  constructor(
    private readonly trains: TrainsService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly lock: DbLockService,
    private readonly scheduler: SchedulerRegistry,
    private readonly jobQueue: JobQueueService,
  ) {}

  onModuleInit(): void {
    this.registerCron();
    if (this.config.trainTimeSyncInitialEnabled) {
      void this.runInitialSyncIfEmpty();
    }
  }

  /** env(TRAIN_TIME_SYNC_CRON) + Asia/Seoul 타임존으로 크론 작업을 동적 등록한다. */
  private registerCron(): void {
    if (this.scheduler.doesExist("cron", CRON_JOB_NAME)) return;
    const job = new CronJob(
      this.config.trainTimeSyncCron,
      () => void this.enqueueScheduled(),
      null,
      false,
      this.config.timezone,
    );
    this.scheduler.addCronJob(CRON_JOB_NAME, job);
    job.start();
    this.logger.log(
      `열차시간 동기화 스케줄러 등록: "${this.config.trainTimeSyncCron}" (${this.config.timezone})`,
    );
  }

  /** 크론/부트스트랩: 스케줄 사전 캐싱을 큐에 적재한다(이미 진행 중이면 건너뜀). */
  private async enqueueScheduled(): Promise<bigint | null> {
    const dates = this.buildDates(
      this.todayYmd(),
      Math.max(1, this.config.trainTimeSyncDays),
    );
    return this.jobQueue.enqueue({
      jobName: CRON_JOB_NAME,
      startYmd: dates[0],
      endYmd: dates[dates.length - 1],
      skipIfRunning: true,
      jobFn: () => this.syncScheduled(),
    });
  }

  /**
   * 관리자 수동 실행: 기간을 검증한 뒤 큐에 적재하고 runId 를 반환한다.
   * 날짜 검증을 선행하므로 잘못된 요청은 즉시 400 으로 응답한다(비동기 실패로 숨지 않음).
   * 동일 기간이 이미 진행 중이면 409.
   */
  async enqueueRange(dto: TrainTimeSyncRangeDto): Promise<bigint> {
    const dates = this.resolveRangeDates(dto); // 유효하지 않으면 여기서 예외
    const runId = await this.jobQueue.enqueue({
      jobName: CRON_JOB_NAME,
      startYmd: dates[0],
      endYmd: dates[dates.length - 1],
      skipIfRunning: false,
      jobFn: () => this.syncRange(dto),
    });
    // skipIfRunning=false 이므로 중복 시 이미 예외가 발생한다 → 여기서는 항상 non-null.
    return runId as bigint;
  }

  private async runInitialSyncIfEmpty(): Promise<void> {
    try {
      const count = await this.prisma.stationTime.count();
      if (count === 0) {
        this.logger.log(
          "저장된 열차시간이 없어 초기 사전 캐싱을 큐에 적재합니다.",
        );
        await this.enqueueScheduled();
      }
    } catch (e) {
      this.logger.warn(
        `초기 사전 캐싱 확인 실패: ${e instanceof Error ? e.message : "unknown"}`,
      );
    }
  }

  /** 스케줄 실행: 오늘(Asia/Seoul) 포함 N일치. */
  async syncScheduled(): Promise<TrainTimeSyncResult> {
    const dates = this.buildDates(
      this.todayYmd(),
      Math.max(1, this.config.trainTimeSyncDays),
    );
    return this.run(dates);
  }

  /** 수동 실행: 관리자가 선택한 기간(startDate/endDate 또는 startDate/days). */
  async syncRange(dto: TrainTimeSyncRangeDto): Promise<TrainTimeSyncResult> {
    const dates = this.resolveRangeDates(dto);
    return this.run(dates);
  }

  /** 주어진 날짜들에 대해 고정 노선을 순회하며 사전 캐싱한다. 분산 락으로 보호한다. */
  private async run(dates: string[]): Promise<TrainTimeSyncResult> {
    const routes = TRAIN_ROUTES.filter((r) => r.depPlaceId !== r.arrPlaceId);
    const result = await this.lock.runExclusive(LOCK_NAME, LOCK_TTL_MS, () =>
      this.doRun(routes, dates),
    );
    if (result === null) {
      this.logger.log("다른 실행이 진행 중이므로 건너뜁니다.");
      return {
        executed: false,
        routes: routes.length,
        dates,
        tasks: 0,
        succeeded: 0,
        failed: 0,
      };
    }
    return result;
  }

  private async doRun(
    routes: readonly TrainRoute[],
    dates: string[],
  ): Promise<TrainTimeSyncResult> {
    this.logger.log(
      `열차시간 사전 캐싱 시작: 노선 ${routes.length}, 날짜 ${dates.length} → 작업 ${routes.length * dates.length}`,
    );

    // (노선 × 날짜) 작업 단위로 펼친다.
    const tasks = routes.flatMap((route) =>
      dates.map((depPlandTime) => ({ route, depPlandTime })),
    );

    const outcomes = await this.mapWithConcurrency(
      tasks,
      Math.max(1, this.config.trainTimeSyncConcurrency),
      async ({ route, depPlandTime }) => {
        await this.trains.refreshTrainTimes({
          depPlaceId: route.depPlaceId,
          arrPlaceId: route.arrPlaceId,
          depPlandTime,
        });
      },
    );

    const succeeded = outcomes.filter((ok) => ok).length;
    const failed = outcomes.length - succeeded;

    this.logger.log(
      `열차시간 사전 캐싱 완료: 성공 ${succeeded}, 실패 ${failed} (총 ${outcomes.length})`,
    );

    return {
      executed: true,
      routes: routes.length,
      dates,
      tasks: tasks.length,
      succeeded,
      failed,
    };
  }

  // ── 날짜 유틸 ─────────────────────────────────────────

  /** 설정된 타임존(Asia/Seoul) 기준 오늘 날짜를 YYYYMMDD 로 반환한다. */
  private todayYmd(): string {
    // en-CA 로케일은 YYYY-MM-DD 형식을 보장한다.
    const ymd = new Intl.DateTimeFormat("en-CA", {
      timeZone: this.config.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    return ymd.replace(/-/g, "");
  }

  /** startYmd(YYYYMMDD) 부터 count 일간의 날짜 목록을 생성한다. (한국은 DST 없음 → UTC 날짜 산술로 안전) */
  private buildDates(startYmd: string, count: number): string[] {
    const y = Number(startYmd.slice(0, 4));
    const m = Number(startYmd.slice(4, 6));
    const d = Number(startYmd.slice(6, 8));
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const dt = new Date(Date.UTC(y, m - 1, d + i));
      const yyyy = dt.getUTCFullYear();
      const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(dt.getUTCDate()).padStart(2, "0");
      out.push(`${yyyy}${mm}${dd}`);
    }
    return out;
  }

  /** 수동 실행 DTO 를 검증된 날짜 목록으로 변환한다. */
  private resolveRangeDates(dto: TrainTimeSyncRangeDto): string[] {
    const startDate = dto.startDate ?? this.todayYmd();
    if (!this.isValidYmd(startDate)) {
      throw new AppException(
        ErrorCode.INVALID_DEPARTURE_DATE,
        "startDate 가 유효한 날짜가 아닙니다.",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.endDate !== undefined) {
      if (!this.isValidYmd(dto.endDate)) {
        throw new AppException(
          ErrorCode.INVALID_DEPARTURE_DATE,
          "endDate 가 유효한 날짜가 아닙니다.",
          HttpStatus.BAD_REQUEST,
        );
      }
      const span = this.daysBetweenInclusive(startDate, dto.endDate);
      if (span < 1) {
        throw new AppException(
          ErrorCode.INVALID_TRAIN_SEARCH_PARAMETER,
          "endDate 는 startDate 이후여야 합니다.",
          HttpStatus.BAD_REQUEST,
        );
      }
      if (span > MAX_RANGE_DAYS) {
        throw new AppException(
          ErrorCode.INVALID_TRAIN_SEARCH_PARAMETER,
          `조회 기간은 최대 ${MAX_RANGE_DAYS}일까지 가능합니다.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return this.buildDates(startDate, span);
    }

    const days = dto.days ?? 7;
    return this.buildDates(startDate, days);
  }

  /** YYYYMMDD 가 달력상 유효한 날짜인지 확인. */
  private isValidYmd(s: string): boolean {
    if (!/^\d{8}$/.test(s)) return false;
    const y = Number(s.slice(0, 4));
    const m = Number(s.slice(4, 6));
    const d = Number(s.slice(6, 8));
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  }

  /** [start, end] 포함 일수. end < start 이면 0 이하. */
  private daysBetweenInclusive(startYmd: string, endYmd: string): number {
    const s = Date.UTC(
      Number(startYmd.slice(0, 4)),
      Number(startYmd.slice(4, 6)) - 1,
      Number(startYmd.slice(6, 8)),
    );
    const e = Date.UTC(
      Number(endYmd.slice(0, 4)),
      Number(endYmd.slice(4, 6)) - 1,
      Number(endYmd.slice(6, 8)),
    );
    return Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
  }

  /**
   * 동시성 제한 map. 각 작업의 성공 여부(boolean)를 반환한다.
   * 개별 작업 실패는 로그 경고 후 false 로 처리하여 전체를 막지 않는다.
   */
  private async mapWithConcurrency<T>(
    items: readonly T[],
    limit: number,
    fn: (item: T) => Promise<void>,
  ): Promise<boolean[]> {
    const results: boolean[] = new Array<boolean>(items.length).fill(false);
    let cursor = 0;
    const workers = Array.from(
      { length: Math.min(limit, items.length) },
      async () => {
        while (cursor < items.length) {
          const index = cursor++;
          try {
            await fn(items[index]);
            results[index] = true;
          } catch (e) {
            results[index] = false;
            this.logger.warn(
              `사전 캐싱 실패(index=${index}): ${
                e instanceof Error ? e.message : "unknown"
              }`,
            );
          }
        }
      },
    );
    await Promise.all(workers);
    return results;
  }
}

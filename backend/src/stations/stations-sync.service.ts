import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../config/app-config.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code';
import { PrismaService } from '../prisma/prisma.service';
import { PublicDataClient } from '../external/public-data.client';
import { JobQueueService } from '../scheduler/job-queue.service';
import { AREA_CODES } from './constants/area-code';

/** 외부 API 에서 정규화된 역 (내부 저장 전 형태) */
interface RawStation {
  nodeid: string;
  nodename: string;
}

export interface StationSyncResult {
  executed: boolean;
  syncedCities: number;
  failedCities: number;
  upserted: number;
  deactivated: number;
}

const STATION_PATH = '/GetCtyAcctoTrainSttnList';
const CRON_JOB_NAME = 'station-sync';
const PAGE_ROWS = 200;
const MAX_PAGES = 100; // 안전장치
const CITY_CONCURRENCY = 6;

@Injectable()
export class StationsSyncService implements OnModuleInit {
  private readonly logger = new Logger(StationsSyncService.name);

  constructor(
    private readonly client: PublicDataClient,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly jobQueue: JobQueueService,
  ) {}

  onModuleInit(): void {
    this.registerCron();
    // 최초 실행 시 역 데이터가 없으면 초기 동기화 (부트스트랩을 막지 않도록 비동기 실행)
    if (this.config.stationSyncInitialEnabled) {
      void this.runInitialSyncIfEmpty();
    }
  }

  /** env(STATION_SYNC_CRON) + Asia/Seoul 타임존으로 크론 작업을 동적 등록한다. */
  private registerCron(): void {
    if (this.scheduler.doesExist('cron', CRON_JOB_NAME)) return;
    const job = new CronJob(
      this.config.stationSyncCron,
      () => void this.enqueueSync(true),
      null,
      false,
      this.config.timezone,
    );
    this.scheduler.addCronJob(CRON_JOB_NAME, job);
    job.start();
    this.logger.log(
      `역 동기화 스케줄러 등록: "${this.config.stationSyncCron}" (${this.config.timezone})`,
    );
  }

  /**
   * 동기화를 큐에 적재한다(실제 실행은 배치 워커가 순차 처리).
   *  - fromSchedule=true(크론/부트스트랩): 이미 진행 중이면 조용히 건너뛴다.
   *  - fromSchedule=false(수동): 진행 중이면 409 ConflictException.
   * 반환은 runId(수동) 또는 null(크론에서 건너뜀).
   */
  private async enqueueSync(fromSchedule: boolean): Promise<bigint | null> {
    const ymd = this.todayYmd();
    return this.jobQueue.enqueue({
      jobName: CRON_JOB_NAME,
      startYmd: ymd,
      endYmd: ymd,
      skipIfRunning: fromSchedule,
      jobFn: () => this.syncAll(),
    });
  }

  /** 관리자 수동 실행: 큐에 적재하고 runId 를 반환한다(진행 중이면 409). */
  async enqueueManualSync(): Promise<bigint> {
    const runId = await this.enqueueSync(false);
    // skipIfRunning=false 이므로 중복 시 이미 예외가 발생한다 → 여기서는 항상 non-null.
    return runId as bigint;
  }

  /** 설정된 타임존(Asia/Seoul) 기준 오늘 날짜(YYYYMMDD). 실행 로그 기록용. */
  private todayYmd(): string {
    // en-CA 로케일은 YYYY-MM-DD 형식을 보장한다.
    const ymd = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.config.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    return ymd.replace(/-/g, '');
  }

  private async runInitialSyncIfEmpty(): Promise<void> {
    try {
      const count = await this.prisma.station.count();
      if (count === 0) {
        this.logger.log('저장된 역 데이터가 없어 초기 동기화를 큐에 적재합니다.');
        await this.enqueueSync(true);
      }
    } catch (e) {
      this.logger.warn(
        `초기 동기화 확인 실패: ${e instanceof Error ? e.message : 'unknown'}`,
      );
    }
  }

  /**
   * 전체 역 목록 동기화. (중복 실행 방지는 큐의 단일 워커 + 적재 시 중복 검사가 담당)
   *  - 도시별로 외부 API 를 페이지네이션 조회
   *  - 전체 실패 시 기존 데이터 유지(쓰기 없음)
   *  - 일부 도시만 성공하면 성공한 도시만 반영
   *  - 성공한 도시별로 upsert + (사라진 역) 비활성화를 트랜잭션으로 처리
   */
  async syncAll(): Promise<StationSyncResult> {
    return this.doSync();
  }

  private async doSync(): Promise<StationSyncResult> {
    this.logger.log('역 동기화 시작');

    const perCity = await this.mapWithConcurrency(
      AREA_CODES,
      CITY_CONCURRENCY,
      async (cityCode) => ({
        cityCode,
        stations: await this.fetchCityStations(cityCode),
      }),
    );

    const succeeded = perCity.filter(
      (r): r is { cityCode: string; stations: RawStation[] } => r !== null,
    );
    const failedCities = perCity.length - succeeded.length;

    // 전체 실패: 기존 데이터를 그대로 유지한다.
    if (succeeded.length === 0) {
      this.logger.error(
        `역 동기화 실패: 모든 도시 조회 실패 - 기존 데이터를 유지합니다.`,
      );
      return {
        executed: true,
        syncedCities: 0,
        failedCities,
        upserted: 0,
        deactivated: 0,
      };
    }

    let upserted = 0;
    let deactivated = 0;
    for (const { cityCode, stations } of succeeded) {
      const counts = await this.persistCity(cityCode, stations);
      upserted += counts.upserted;
      deactivated += counts.deactivated;
    }

    this.logger.log(
      `역 동기화 완료: 성공 도시 ${succeeded.length}, 실패 도시 ${failedCities}, upsert ${upserted}, 비활성화 ${deactivated}`,
    );

    return {
      executed: true,
      syncedCities: succeeded.length,
      failedCities,
      upserted,
      deactivated,
    };
  }

  /** 한 도시의 upsert + 사라진 역 비활성화를 하나의 트랜잭션으로 처리한다. */
  private async persistCity(
    cityCode: string,
    stations: RawStation[],
  ): Promise<{ upserted: number; deactivated: number }> {
    const nodeIds = stations.map((s) => s.nodeid);
    const now = new Date();

    return this.prisma.$transaction(
      async (tx) => {
        for (const s of stations) {
          await tx.station.upsert({
            where: { nodeid: s.nodeid },
            create: {
              nodeid: s.nodeid,
              nodename: s.nodename,
              cityCode,
              isActive: true,
              syncedAt: now,
            },
            update: {
              nodename: s.nodename,
              cityCode,
              isActive: true,
              syncedAt: now,
            },
          });
        }
        // 이번 응답에 없는 이 도시의 역은 비활성화 (더 이상 존재하지 않음)
        const deactivatedRes = await tx.station.updateMany({
          where: { cityCode, isActive: true, nodeid: { notIn: nodeIds } },
          data: { isActive: false },
        });
        return { upserted: stations.length, deactivated: deactivatedRes.count };
      },
      { timeout: 20000 },
    );
  }

  /** 한 도시의 역을 페이지네이션으로 모두 조회하고 nodeid 기준 중복 제거한다. */
  async fetchCityStations(cityCode: string): Promise<RawStation[]> {
    const all: RawStation[] = [];
    let pageNo = 1;
    let total = Number.POSITIVE_INFINITY;

    while ((pageNo - 1) * PAGE_ROWS < total && pageNo <= MAX_PAGES) {
      const data = await this.client.get(STATION_PATH, {
        cityCode,
        pageNo,
        numOfRows: PAGE_ROWS,
      });
      const { items, totalCount } = this.extractBody(data);
      total = totalCount;
      const parsed = this.normalizeItems(items);
      all.push(...parsed);
      if (parsed.length < PAGE_ROWS) break; // 마지막 페이지
      pageNo += 1;
    }

    return this.dedupeByNodeId(all);
  }

  /** 외부 응답 봉투에서 items/totalCount 추출. 형식이 어긋나면 외부 오류로 변환. */
  private extractBody(data: unknown): { items: unknown; totalCount: number } {
    const response = (data as { response?: unknown })?.response as
      | {
          header?: { resultCode?: string; resultMsg?: string };
          body?: { items?: unknown; totalCount?: unknown };
        }
      | undefined;

    if (!response || !response.body) {
      throw new AppException(
        ErrorCode.EXTERNAL_TRAIN_API_ERROR,
        '역 목록 외부 API 응답 형식이 올바르지 않습니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }
    const resultCode = response.header?.resultCode;
    if (resultCode !== undefined && resultCode !== '00') {
      throw new AppException(
        ErrorCode.EXTERNAL_TRAIN_API_ERROR,
        '역 목록 외부 API 오류 응답입니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }
    const totalCount = Number(response.body.totalCount ?? 0);
    return {
      items: response.body.items,
      totalCount: Number.isFinite(totalCount) ? totalCount : 0,
    };
  }

  /** items 가 배열/단일객체/빈값 모두 올 수 있으므로 정규화한다. */
  private normalizeItems(items: unknown): RawStation[] {
    // items 가 '' 또는 null 인 경우 (결과 없음)
    if (!items || typeof items !== 'object') return [];
    const rawItem = (items as { item?: unknown }).item;
    if (!rawItem) return [];
    const list = Array.isArray(rawItem) ? rawItem : [rawItem];
    return list
      .map((it) => {
        const obj = it as { nodeid?: unknown; nodename?: unknown };
        return {
          nodeid: this.toField(obj?.nodeid),
          nodename: this.toField(obj?.nodename),
        };
      })
      .filter((s) => s.nodeid !== '' && s.nodename !== '');
  }

  /** 외부 값(문자열/숫자)을 안전하게 문자열로 변환한다. 그 외 타입은 빈 문자열. */
  private toField(v: unknown): string {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  }

  private dedupeByNodeId(stations: RawStation[]): RawStation[] {
    const seen = new Set<string>();
    const result: RawStation[] = [];
    for (const s of stations) {
      if (seen.has(s.nodeid)) continue;
      seen.add(s.nodeid);
      result.push(s);
    }
    return result;
  }

  /**
   * 동시성 제한 map. 각 작업이 실패하면 해당 항목은 null 로 반환(도시별 부분 실패 허용).
   */
  private async mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T) => Promise<R>,
  ): Promise<(R | null)[]> {
    const results: (R | null)[] = new Array<R | null>(items.length).fill(null);
    let cursor = 0;
    const workers = Array.from(
      { length: Math.min(limit, items.length) },
      async () => {
        while (cursor < items.length) {
          const index = cursor++;
          try {
            results[index] = await fn(items[index]);
          } catch (e) {
            results[index] = null;
            this.logger.warn(
              `도시 동기화 실패(index=${index}): ${
                e instanceof Error ? e.message : 'unknown'
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

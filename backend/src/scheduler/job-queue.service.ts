import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EnqueueParams, JobEntry, JobStatus } from './interfaces/job.interface';

/**
 * 전역 단일 FIFO 작업 큐.
 *  - 크론/수동 트리거가 enqueue 로 작업을 적재하면 scheduler_run_log 에 PENDING 행을 만들고
 *    인메모리 큐에 넣는다. 워커가 하나씩 꺼내 실행한다(jobName 과 무관하게 동시 1개).
 *  - Node 단일 스레드라 인스턴스 내부에서는 별도 락 없이 순차 실행이 보장된다.
 *  - 서버 재시작 시 인메모리 큐는 사라지므로, 남아있는 PENDING/RUNNING 행은 FAILED 로 복구한다.
 *
 * ⚠️ 다중 인스턴스: 인메모리 큐는 인스턴스별로 독립이다. 인스턴스 간 중복은 scheduler_run_log
 *    의 PENDING/RUNNING 중복 검사(공유 DB)로 대부분 걸러지나 동시 enqueue 경합까지는 막지
 *    못한다. 단일 인스턴스 운영을 전제로 한다.
 */
@Injectable()
export class JobQueueService implements OnModuleInit {
  private readonly logger = new Logger(JobQueueService.name);
  private readonly queue: JobEntry[] = [];
  private processing = false;

  constructor(private readonly prisma: PrismaService) {}

  /** 서버 시작 시 이전 실행에서 중단된 PENDING/RUNNING 행을 FAILED 로 정리한다. */
  async onModuleInit(): Promise<void> {
    const updated = await this.prisma.schedulerRunLog.updateMany({
      where: { status: { in: [JobStatus.PENDING, JobStatus.RUNNING] } },
      data: {
        status: JobStatus.FAILED,
        errorMessage: 'Interrupted: server restarted',
        endedAt: new Date(),
      },
    });
    if (updated.count > 0) {
      this.logger.warn(
        `중단된 작업 ${updated.count}건을 FAILED 로 복구했습니다.`,
      );
    }
  }

  /**
   * 작업을 큐에 적재하고 PENDING 행의 runId 를 반환한다.
   *  - 중복(같은 jobName+기간의 PENDING/RUNNING)이면:
   *      skipIfRunning=true → null 반환 (크론), 아니면 409 ConflictException (수동).
   *  - force=true 면 중복 검사를 건너뛴다.
   */
  async enqueue(params: EnqueueParams): Promise<bigint | null> {
    const {
      jobName,
      startYmd,
      endYmd,
      force = false,
      skipIfRunning = false,
      jobFn,
    } = params;

    if (!force) {
      const active = await this.prisma.schedulerRunLog.findFirst({
        where: {
          jobName,
          startYmd,
          endYmd,
          status: { in: [JobStatus.PENDING, JobStatus.RUNNING] },
        },
      });
      if (active) {
        if (skipIfRunning) {
          this.logger.log(
            `이미 진행 중인 작업이 있어 건너뜁니다: ${jobName} ${startYmd}~${endYmd} (runId=${active.runId})`,
          );
          return null;
        }
        throw new ConflictException(
          `이미 진행 중인 작업이 있습니다: ${jobName} ${startYmd}~${endYmd} (runId=${active.runId})`,
        );
      }
    }

    const log = await this.prisma.schedulerRunLog.create({
      data: {
        jobName,
        status: JobStatus.PENDING,
        startYmd,
        endYmd,
        startedAt: new Date(),
      },
    });
    const runId = log.runId;

    this.queue.push({ runId, jobFn });
    this.logger.log(`작업 적재: ${jobName} ${startYmd}~${endYmd} (runId=${runId})`);
    void this.startWorker();
    return runId;
  }

  /** 아직 시작하지 않은(PENDING) 작업을 취소한다. 성공하면 true. */
  async cancelPending(runId: bigint): Promise<boolean> {
    const res = await this.prisma.schedulerRunLog.updateMany({
      where: { runId, status: JobStatus.PENDING },
      data: { status: JobStatus.CANCELLED, endedAt: new Date() },
    });
    if (res.count === 0) return false;
    const idx = this.queue.findIndex((e) => e.runId === runId);
    if (idx !== -1) this.queue.splice(idx, 1);
    this.logger.log(`대기 작업 취소 (runId=${runId}).`);
    return true;
  }

  /** 큐를 순차적으로 비우는 단일 워커. 이미 실행 중이면 즉시 반환한다. */
  private async startWorker(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const entry = this.queue.shift();
        if (entry) await this.runEntry(entry);
      }
    } finally {
      this.processing = false;
      // 워커가 종료되는 사이 새 작업이 들어왔다면 다시 기동한다.
      if (this.queue.length > 0) void this.startWorker();
    }
  }

  /** 한 작업을 실행하고 결과에 따라 상태/메타데이터를 갱신한다. */
  private async runEntry(entry: JobEntry): Promise<void> {
    const { runId, jobFn } = entry;

    // PENDING → RUNNING 원자적 클레임. 그 사이 취소됐으면 count=0 이라 실행하지 않는다.
    const claimed = await this.prisma.schedulerRunLog.updateMany({
      where: { runId, status: JobStatus.PENDING },
      data: { status: JobStatus.RUNNING },
    });
    if (claimed.count === 0) {
      this.logger.log(`실행 전 취소된 작업을 건너뜁니다 (runId=${runId}).`);
      return;
    }

    try {
      const result = await jobFn(runId);
      await this.prisma.schedulerRunLog.update({
        where: { runId },
        data: {
          status: JobStatus.SUCCESS,
          endedAt: new Date(),
          metadata:
            result === undefined || result === null
              ? Prisma.DbNull
              : (result as unknown as Prisma.InputJsonValue),
        },
      });
      this.logger.log(`작업 완료 (runId=${runId}).`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`작업 실패 (runId=${runId}): ${errorMessage}`);
      await this.prisma.schedulerRunLog.update({
        where: { runId },
        data: {
          status: JobStatus.FAILED,
          endedAt: new Date(),
          errorMessage,
        },
      });
    }
  }
}

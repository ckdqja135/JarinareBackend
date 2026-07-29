import { ConflictException } from '@nestjs/common';
import { JobQueueService } from './job-queue.service';

/** 마이크로태스크가 모두 처리된 뒤(=워커 완료 후) 단언하기 위한 플러시. */
const flush = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

interface Row {
  runId: bigint;
  jobName: string;
  status: string;
  startYmd: string;
  endYmd: string;
  startedAt?: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  metadata: unknown;
}

/** scheduler_run_log 를 흉내내는 최소 인메모리 Prisma 목. */
function createPrismaMock() {
  const rows: Row[] = [];
  let seq = 0n;

  const matches = (r: Row, where: any): boolean => {
    const byRunId = where.runId === undefined || r.runId === where.runId;
    const byJob = where.jobName === undefined || r.jobName === where.jobName;
    const byStart = where.startYmd === undefined || r.startYmd === where.startYmd;
    const byEnd = where.endYmd === undefined || r.endYmd === where.endYmd;
    let byStatus = true;
    if (where.status !== undefined) {
      byStatus = where.status.in
        ? where.status.in.includes(r.status)
        : r.status === where.status;
    }
    return byRunId && byJob && byStart && byEnd && byStatus;
  };

  return {
    _rows: rows,
    schedulerRunLog: {
      create: jest.fn(({ data }: any) => {
        seq += 1n;
        const row: Row = {
          runId: seq,
          endedAt: null,
          errorMessage: null,
          metadata: null,
          ...data,
        };
        rows.push(row);
        return Promise.resolve(row);
      }),
      findFirst: jest.fn(({ where }: any) =>
        Promise.resolve(rows.find((r) => matches(r, where)) ?? null),
      ),
      updateMany: jest.fn(({ where, data }: any) => {
        let count = 0;
        for (const r of rows) {
          if (matches(r, where)) {
            Object.assign(r, data);
            count += 1;
          }
        }
        return Promise.resolve({ count });
      }),
      update: jest.fn(({ where, data }: any) => {
        const r = rows.find((x) => x.runId === where.runId)!;
        Object.assign(r, data);
        return Promise.resolve(r);
      }),
    },
  };
}

describe('JobQueueService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: JobQueueService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new JobQueueService(prisma as never);
  });

  it('enqueue → 워커가 실행하고 SUCCESS + metadata 를 저장한다', async () => {
    const jobFn = jest.fn(() => Promise.resolve({ ok: true, count: 3 }));
    const runId = await service.enqueue({
      jobName: 'station-sync',
      startYmd: '20260729',
      endYmd: '20260729',
      jobFn,
    });
    await flush();

    expect(runId).toBe(1n);
    expect(jobFn).toHaveBeenCalledTimes(1);
    const row = prisma._rows[0];
    expect(row.status).toBe('SUCCESS');
    expect(row.metadata).toEqual({ ok: true, count: 3 });
    expect(row.endedAt).toBeInstanceOf(Date);
  });

  it('jobFn 이 예외를 던지면 FAILED + errorMessage 로 기록한다', async () => {
    const jobFn = jest.fn(() => Promise.reject(new Error('boom')));
    await service.enqueue({
      jobName: 'j',
      startYmd: 'd',
      endYmd: 'd',
      jobFn,
    });
    await flush();

    const row = prisma._rows[0];
    expect(row.status).toBe('FAILED');
    expect(row.errorMessage).toBe('boom');
    expect(row.endedAt).toBeInstanceOf(Date);
  });

  it('여러 작업을 한 번에 하나씩 순차 실행한다', async () => {
    const order: number[] = [];
    const make = (n: number) => () => {
      order.push(n);
      return Promise.resolve();
    };
    await service.enqueue({ jobName: 'a', startYmd: '1', endYmd: '1', jobFn: make(1) });
    await service.enqueue({ jobName: 'b', startYmd: '2', endYmd: '2', jobFn: make(2) });
    await service.enqueue({ jobName: 'c', startYmd: '3', endYmd: '3', jobFn: make(3) });
    await flush();

    expect(order).toEqual([1, 2, 3]);
    expect(prisma._rows.every((r) => r.status === 'SUCCESS')).toBe(true);
  });

  it('중복(PENDING/RUNNING) + skipIfRunning=true 면 null 을 반환하고 실행하지 않는다', async () => {
    prisma._rows.push({
      runId: 99n,
      jobName: 'j',
      status: 'RUNNING',
      startYmd: 'd',
      endYmd: 'd',
      endedAt: null,
      errorMessage: null,
      metadata: null,
    });
    const jobFn = jest.fn(() => Promise.resolve());
    const runId = await service.enqueue({
      jobName: 'j',
      startYmd: 'd',
      endYmd: 'd',
      skipIfRunning: true,
      jobFn,
    });

    expect(runId).toBeNull();
    expect(jobFn).not.toHaveBeenCalled();
  });

  it('중복 + skipIfRunning=false(기본) 면 ConflictException 을 던진다', async () => {
    prisma._rows.push({
      runId: 99n,
      jobName: 'j',
      status: 'PENDING',
      startYmd: 'd',
      endYmd: 'd',
      endedAt: null,
      errorMessage: null,
      metadata: null,
    });
    await expect(
      service.enqueue({
        jobName: 'j',
        startYmd: 'd',
        endYmd: 'd',
        jobFn: () => Promise.resolve(),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('force=true 면 중복이어도 새 작업을 적재/실행한다', async () => {
    prisma._rows.push({
      runId: 99n,
      jobName: 'j',
      status: 'RUNNING',
      startYmd: 'd',
      endYmd: 'd',
      endedAt: null,
      errorMessage: null,
      metadata: null,
    });
    const jobFn = jest.fn(() => Promise.resolve());
    const runId = await service.enqueue({
      jobName: 'j',
      startYmd: 'd',
      endYmd: 'd',
      force: true,
      jobFn,
    });
    await flush();

    expect(runId).toBe(1n);
    expect(jobFn).toHaveBeenCalledTimes(1);
  });

  it('cancelPending: PENDING 작업을 CANCELLED 로 바꾸고, 이미 종료된 작업엔 false', async () => {
    prisma._rows.push({
      runId: 5n,
      jobName: 'j',
      status: 'PENDING',
      startYmd: 'd',
      endYmd: 'd',
      endedAt: null,
      errorMessage: null,
      metadata: null,
    });

    expect(await service.cancelPending(5n)).toBe(true);
    expect(prisma._rows[0].status).toBe('CANCELLED');
    // 이미 CANCELLED 이므로 다시 취소하면 false
    expect(await service.cancelPending(5n)).toBe(false);
  });

  it('onModuleInit: 중단된 PENDING/RUNNING 을 FAILED 로 복구하고 종료 건은 유지', async () => {
    const seed = (runId: bigint, status: string): Row => ({
      runId,
      jobName: 'j',
      status,
      startYmd: 'd',
      endYmd: 'd',
      endedAt: status === 'SUCCESS' ? new Date() : null,
      errorMessage: null,
      metadata: null,
    });
    prisma._rows.push(seed(1n, 'PENDING'), seed(2n, 'RUNNING'), seed(3n, 'SUCCESS'));

    await service.onModuleInit();

    expect(prisma._rows[0].status).toBe('FAILED');
    expect(prisma._rows[1].status).toBe('FAILED');
    expect(prisma._rows[2].status).toBe('SUCCESS');
    expect(prisma._rows[0].errorMessage).toBe('Interrupted: server restarted');
  });
});

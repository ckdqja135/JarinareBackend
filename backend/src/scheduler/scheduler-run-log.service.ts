import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** 실행 로그 응답 항목. runId 는 BigInt 직렬화 문제를 피하려고 문자열로 변환한다. */
export interface SchedulerRunLogItem {
  runId: string;
  jobName: string;
  status: string;
  startYmd: string;
  endYmd: string;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  metadata: unknown;
}

/**
 * scheduler_run_log 조회 전용 서비스. (쓰기는 JobQueueService 가 담당)
 */
@Injectable()
export class SchedulerRunLogService {
  constructor(private readonly prisma: PrismaService) {}

  /** 최근 실행 로그 목록 (최신순). jobName / status 로 선택 필터링. */
  async list(params: {
    limit: number;
    jobName?: string;
    status?: string;
  }): Promise<SchedulerRunLogItem[]> {
    const rows = await this.prisma.schedulerRunLog.findMany({
      where: {
        ...(params.jobName ? { jobName: params.jobName } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
      orderBy: { runId: 'desc' },
      take: params.limit,
    });
    return rows.map((r) => ({
      runId: r.runId.toString(),
      jobName: r.jobName,
      status: r.status,
      startYmd: r.startYmd,
      endYmd: r.endYmd,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      errorMessage: r.errorMessage,
      metadata: r.metadata,
    }));
  }

  /** 상태별 건수 요약. 예) { PENDING: 1, RUNNING: 0, SUCCESS: 12, FAILED: 2 } */
  async summary(): Promise<Record<string, number>> {
    const grouped = await this.prisma.schedulerRunLog.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const out: Record<string, number> = {};
    for (const g of grouped) out[g.status] = g._count._all;
    return out;
  }
}

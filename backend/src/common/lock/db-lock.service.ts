import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * DB 기반 TTL 분산 락. 다중 인스턴스에서 스케줄러/배치의 중복 실행을 방지한다.
 * 커넥션 풀과 무관하도록 원자적 SQL(create / 조건부 updateMany)만 사용한다.
 * (MySQL GET_LOCK 은 커넥션에 종속되어 풀 환경에서 신뢰하기 어렵다.)
 */
@Injectable()
export class DbLockService {
  private readonly logger = new Logger(DbLockService.name);
  // 인스턴스 식별자 (누가 락을 소유했는지 구분)
  private readonly owner = `${os.hostname()}#${process.pid}`;

  constructor(private readonly prisma: PrismaService) {}

  /** 락 획득 시도. 성공하면 true. 이미 유효한 락이 있으면 false. */
  async acquire(name: string, ttlMs: number): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    // 1) 락 행이 없으면 생성하여 즉시 획득
    try {
      await this.prisma.syncLock.create({
        data: { name, lockedBy: this.owner, lockedAt: now, expiresAt },
      });
      return true;
    } catch (e) {
      const isDuplicate =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
      if (!isDuplicate) {
        this.logger.warn(
          `락 생성 오류(${name}): ${e instanceof Error ? e.message : 'unknown'}`,
        );
      }
    }

    // 2) 이미 존재하면 만료된 경우에만 원자적으로 소유권 이전
    const res = await this.prisma.syncLock.updateMany({
      where: { name, expiresAt: { lt: now } },
      data: { lockedBy: this.owner, lockedAt: now, expiresAt },
    });
    return res.count === 1;
  }

  /** 내가 소유한 락을 해제(즉시 만료 처리). */
  async release(name: string): Promise<void> {
    await this.prisma.syncLock.updateMany({
      where: { name, lockedBy: this.owner },
      data: { expiresAt: new Date(0) },
    });
  }

  /**
   * 락을 획득한 경우에만 fn 을 실행하고 항상 해제한다.
   * 락을 얻지 못하면(다른 인스턴스 실행 중) null 을 반환한다.
   */
  async runExclusive<T>(
    name: string,
    ttlMs: number,
    fn: () => Promise<T>,
  ): Promise<T | null> {
    const acquired = await this.acquire(name, ttlMs);
    if (!acquired) return null;
    try {
      return await fn();
    } finally {
      await this.release(name);
    }
  }
}

// @role: features/seat
// @rule: 좌석 트랜잭션의 DB 오류 판별과 교착 재시도만 담당
import { Prisma } from "../generated/prisma/client";

/** UNIQUE 위반 — 모델 쿼리는 P2002, raw 쿼리는 드라이버 오류(1062)로 올라온다 */
export function isUniqueViolation(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return true;
  }
  return e instanceof Error && /Duplicate entry|\b1062\b/.test(e.message);
}

/** 교착(1213)·락 대기 초과(1205) — 같은 요청을 다시 하면 대개 성공한다 */
function isRetryable(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") {
    return true;
  }
  return (
    e instanceof Error &&
    /deadlock|lock wait timeout|\b1213\b|\b1205\b/i.test(e.message)
  );
}

const MAX_ATTEMPTS = 3;

/**
 * 교착으로 희생된 트랜잭션을 다시 실행한다.
 *
 * 잠금 순서를 고정해 교착을 최대한 피하지만, InnoDB 는 UNIQUE 검사 중의 갭 락처럼
 * 순서로 다 막을 수 없는 경우가 있다. 교착은 DB 가 한쪽을 롤백시켜 끝내므로
 * 롤백된 쪽이 처음부터 다시 하면 된다. 다시 할 때는 바뀐 상태를 새로 읽으므로
 * "그 사이 남이 가져갔다" 는 정상적인 비즈니스 오류로 바뀌어 나온다.
 */
export async function withDeadlockRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(e)) throw e;
      // 같은 순간에 다시 부딪히지 않도록 조금씩 어긋나게 기다린다.
      await new Promise((r) =>
        setTimeout(r, 15 * attempt + Math.random() * 30),
      );
    }
  }
}

/** 좌석 트랜잭션 공통 옵션 */
export const SEAT_TX_OPTIONS = {
  // REPEATABLE READ 의 갭 락이 좌석 INSERT 끼리 교착을 만들기 쉬워 READ COMMITTED 로 낮춘다.
  // 정합성은 격리 수준이 아니라 UNIQUE 제약과 FOR UPDATE 로 지킨다.
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  maxWait: 5_000,
  timeout: 10_000,
};

/** raw 쿼리의 BIGINT 는 드라이버 설정에 따라 bigint·number·string 으로 올 수 있다 */
export const toBigInt = (v: unknown): bigint =>
  BigInt(v as string | number | bigint);

// @role: features/point
// @rule: 포인트 잔액 변경(결제 사용·페이백, 좌석 교환 보상)과 적립 내역 조회만 담당
import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";

/** 좌석 교환 n 회마다 포인트를 준다 (기존 프론트 useHandleChange 규칙) */
export const CHANGE_REWARD_EVERY = 5;
export const CHANGE_REWARD_POINT = 2000;

/** 기존 Firestore payments/{uid}/detail 문서 모양 그대로 */
export interface PointHistoryDto {
  accruedPoint: number;
  /** 초 단위 epoch — 기존 프론트 PaymentType.createAt 과 같다 */
  createAt: number;
}

@Injectable()
export class PointService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 결제 시 포인트 사용과 카드 페이백을 한 번에 반영한다.
   *
   * 기존 앱은 "현재 잔액 − 사용 + 페이백" 을 계산해 잔액을 덮어썼다(updatePoint).
   * 두 탭에서 동시에 결제하면 한쪽 차감이 사라지는 방식이라, 여기서는 사용자 행을
   * 잠그고 잔액을 확인한 뒤 증감으로 바꾼다. 예매와 같은 트랜잭션에서 부른다.
   */
  async applyPayment(
    tx: Prisma.TransactionClient,
    userIdx: bigint,
    usedPoint: number,
    paybackPoint: number,
  ): Promise<void> {
    if (usedPoint === 0 && paybackPoint === 0) return;
    const rows = await tx.$queryRaw<{ point: number }[]>`
      SELECT point FROM users WHERE idx = ${userIdx} FOR UPDATE`;
    const balance = Number(rows[0]?.point ?? 0);
    if (balance < usedPoint) {
      throw new AppException(
        ErrorCode.INSUFFICIENT_POINT,
        `포인트가 부족합니다. (보유 ${balance}P, 사용 ${usedPoint}P)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await tx.user.update({
      where: { idx: userIdx },
      data: { point: { increment: paybackPoint - usedPoint } },
    });
  }

  /**
   * 좌석 교환이 성사됐을 때 수락한 사람에게 주는 보상.
   * 기존 앱처럼 변경 횟수를 1 올리고, 5회째마다 2000P 와 적립 내역을 남긴다.
   * 교환과 같은 트랜잭션에서 불러 "자리는 바뀌었는데 보상만 빠짐" 이 없게 한다.
   */
  async rewardSeatChange(
    tx: Prisma.TransactionClient,
    userIdx: bigint,
  ): Promise<void> {
    const rows = await tx.$queryRaw<{ seatChageCount: number }[]>`
      SELECT seatChageCount FROM users WHERE idx = ${userIdx} FOR UPDATE`;
    const count = Number(rows[0]?.seatChageCount ?? 0) + 1;
    const reward = count % CHANGE_REWARD_EVERY === 0 ? CHANGE_REWARD_POINT : 0;

    await tx.user.update({
      where: { idx: userIdx },
      data: { seatChageCount: count, point: { increment: reward } },
    });
    if (reward > 0) {
      await tx.pointHistory.create({
        data: { userIdx, amount: reward, reason: "SEAT_CHANGE_REWARD" },
      });
    }
  }

  async listHistory(user: AuthUser): Promise<PointHistoryDto[]> {
    const rows = await this.prisma.pointHistory.findMany({
      where: { userIdx: BigInt(user.idx) },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      accruedPoint: r.amount,
      createAt: Math.floor(r.createdAt.getTime() / 1000),
    }));
  }
}

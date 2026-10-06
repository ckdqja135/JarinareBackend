// @role: features/point
// @rule: 결제·반환 내역 기록과 조회만 담당
import { Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";

/** 기존 Firestore orders/{uid}/detail 문서 모양 그대로 (프론트 OrderType) */
export interface OrderHistoryDto {
  startStationForView: string;
  endStationForView: string;
  startDay: string;
  startDayForView: string;
  trainType: string;
  selectAdult: number;
  selectKid: number;
  seatCount: number;
  finalPrice: number;
  paymentMethod: string;
  selectedCard: string | null;
  isReturn: boolean;
  /** 초 단위 epoch — 기존 프론트 OrderType.createAt 과 같다 */
  createAt: number;
}

export type OrderHistoryInput = Omit<
  Prisma.OrderHistoryUncheckedCreateInput,
  "id" | "createdAt"
>;

@Injectable()
export class OrderHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /** 예매·반환과 같은 트랜잭션에서 부른다. */
  async record(
    tx: Prisma.TransactionClient,
    data: OrderHistoryInput,
  ): Promise<void> {
    await tx.orderHistory.create({ data });
  }

  async listMine(user: AuthUser): Promise<OrderHistoryDto[]> {
    const rows = await this.prisma.orderHistory.findMany({
      where: { userIdx: BigInt(user.idx) },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      startStationForView: r.startStationForView,
      endStationForView: r.endStationForView,
      startDay: r.startDay,
      startDayForView: r.startDayForView,
      trainType: r.trainType,
      selectAdult: r.selectAdult,
      selectKid: r.selectKid,
      seatCount: r.seatCount,
      finalPrice: r.finalPrice,
      paymentMethod: r.paymentMethod,
      selectedCard: r.selectedCard,
      isReturn: r.isReturn,
      createAt: Math.floor(r.createdAt.getTime() / 1000),
    }));
  }
}

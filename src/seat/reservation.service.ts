// @role: features/seat
// @rule: 예매 확정·조회·취소만 담당
import { randomUUID } from "crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { ACTIVE, PassengerType } from "./seat.constants";
import {
  SEAT_TX_OPTIONS,
  isUniqueViolation,
  withDeadlockRetry,
} from "./seat-db.util";
import { TripService, toTripDto, type TripDto } from "./trip.service";
import { SeatLayoutService } from "./seat-layout.service";
import { PointService } from "../point/point.service";
import { OrderHistoryService } from "../point/order-history.service";
import { TravelStatService } from "../travel-stat/travel-stat.service";
import type {
  CancelReservationDto,
  CreateReservationDto,
} from "./dto/seat.dto";

export interface TicketDto {
  reservationId: number;
  carNo: number;
  seatId: string;
  passengerType: string;
  price: number;
}

/** 한 번에 결제한 묶음. 교환을 거치면 한 묶음 안에 여러 호차 좌석이 섞일 수 있다. */
export interface OrderDto {
  orderId: string;
  trip: TripDto;
  adult: number;
  kid: number;
  totalPrice: number;
  tickets: TicketDto[];
}

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripService,
    private readonly layouts: SeatLayoutService,
    private readonly points: PointService,
    private readonly orderHistories: OrderHistoryService,
    private readonly travelStats: TravelStatService,
  ) {}

  /**
   * 예매 확정 — 영화 예매의 "결제 완료" 단계.
   *
   * 기존 결제 화면(usePayModal.handlePay)이 클라이언트에서 차례로 하던 일
   * (좌석 저장 → 포인트 반영 → 통계 → 결제 내역)을 서버에서 한다.
   *
   * 1) 내 선점이 아직 살아 있는지 FOR UPDATE 로 잠그며 확인한다.
   *    잠가 두면 확정 도중 선점이 만료돼도 남이 그 행을 인수(upsert)하지 못하고 기다린다.
   * 2) 예약 INSERT. UNIQUE(tripId, carNo, seatId, canceledAt) 가 최종 방어선이다 —
   *    선점 절차를 우회한 어떤 경로가 있어도 같은 좌석의 활성 예약은 1건뿐이다.
   * 3) 선점 삭제, 포인트 사용·페이백, 결제 내역.
   * 전부 한 트랜잭션이라 "좌석은 팔렸는데 포인트만 안 빠짐" 같은 중간 상태가 없다.
   * 목적지 통계만 커밋 뒤에 따로 올린다 (TravelStatService 주석 참고).
   */
  async create(dto: CreateReservationDto, user: AuthUser): Promise<OrderDto> {
    const seatIds = [...new Set(dto.seatIds)].sort();
    if (dto.adult + dto.kid !== seatIds.length) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        `인원(성인 ${dto.adult} + 아동 ${dto.kid})과 좌석 수(${seatIds.length})가 다릅니다.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const trip = await this.trips.get(dto.tripId);
    await this.layouts.assertSeatsExist(trip.trainType, dto.carNo, seatIds);

    const me = BigInt(user.idx);
    const now = new Date();
    const orderId = randomUUID();
    const prices = splitPrice(dto.totalPrice, seatIds.length);

    try {
      await withDeadlockRetry(() =>
        this.prisma.$transaction(async (tx) => {
          const held = await tx.$queryRaw<{ seatId: string }[]>`
            SELECT seatId FROM seat_holds
            WHERE tripId = ${trip.id} AND carNo = ${dto.carNo}
              AND seatId IN (${Prisma.join(seatIds)})
              AND userIdx = ${me} AND expiresAt > ${now}
            FOR UPDATE`;
          if (held.length !== seatIds.length) {
            const have = new Set(held.map((h) => h.seatId));
            throw new AppException(
              ErrorCode.SEAT_STATE_CHANGED,
              `선점이 만료됐거나 선점하지 않은 좌석입니다: ${seatIds
                .filter((s) => !have.has(s))
                .join(", ")}. 좌석을 다시 선택해 주세요.`,
              HttpStatus.CONFLICT,
            );
          }

          await tx.reservation.createMany({
            data: seatIds.map((seatId, i) => ({
              tripId: trip.id,
              carNo: dto.carNo,
              seatId,
              userIdx: me,
              orderId,
              passengerType:
                i < dto.adult ? PassengerType.ADULT : PassengerType.CHILD,
              price: prices[i],
              canceledAt: ACTIVE,
            })),
          });

          await tx.seatHold.deleteMany({
            where: {
              tripId: trip.id,
              carNo: dto.carNo,
              seatId: { in: seatIds },
              userIdx: me,
            },
          });

          await this.points.applyPayment(
            tx,
            me,
            dto.usedPoint ?? 0,
            dto.paybackPoint ?? 0,
          );

          await this.orderHistories.record(tx, {
            userIdx: me,
            tripId: trip.id,
            reservationOrderId: orderId,
            startStationForView: trip.depName,
            endStationForView: trip.arrName,
            startDay: trip.depPlandTime.slice(0, 8),
            startDayForView: dto.startDayForView ?? "",
            trainType: trip.trainType,
            selectAdult: dto.adult,
            selectKid: dto.kid,
            seatCount: seatIds.length,
            finalPrice: dto.totalPrice,
            usedPoint: dto.usedPoint ?? 0,
            paybackPoint: dto.paybackPoint ?? 0,
            paymentMethod: dto.paymentMethod ?? "",
            selectedCard: dto.selectedCard ?? null,
            isReturn: false,
          });
        }, SEAT_TX_OPTIONS),
      );
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new AppException(
          ErrorCode.SEAT_ALREADY_RESERVED,
          "이미 예매된 좌석이 포함되어 있습니다.",
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }

    await this.travelStats.recordReservation(trip.arrName, me);

    const [order] = await this.findOrders({ orderId, canceledAt: ACTIVE });
    return order;
  }

  /** 내 예매 목록 (활성분). 출발 시각 순. */
  listMine(user: AuthUser): Promise<OrderDto[]> {
    return this.findOrders({ userIdx: BigInt(user.idx), canceledAt: ACTIVE });
  }

  /**
   * 예매 취소(반환). 좌석 단위로 취소할 수 있다.
   *
   * 행을 지우지 않고 canceledAt 에 취소 시각을 넣는다. 그 순간 UNIQUE 의 활성 슬롯
   * (canceledAt = sentinel)이 비므로 같은 좌석을 바로 다시 팔 수 있다.
   * 기존 앱(useTicketReturn)처럼 반환 내역을 남기고, 포인트는 돌려주지 않는다.
   *
   * 이 예약을 걸고 있던 대기 중 교환 신청은 여기서 건드리지 않는다. 수락 시점에
   * 예약 상태를 다시 확인해 걸러지고, 어차피 1분이면 만료된다. 여기서 신청까지
   * 잠그면 수락 경로와 잠금 순서가 뒤집혀 교착 여지가 생긴다.
   */
  async cancel(
    dto: CancelReservationDto,
    user: AuthUser,
  ): Promise<{ canceled: number }> {
    const me = BigInt(user.idx);
    const ids = dto.reservationIds.map((id) => BigInt(id));
    const now = new Date();

    const canceled = await withDeadlockRetry(() =>
      this.prisma.$transaction(async (tx) => {
        const rows = await tx.reservation.findMany({
          where: { id: { in: ids }, userIdx: me, canceledAt: ACTIVE },
          include: { trip: true },
          orderBy: { id: "asc" },
        });
        if (rows.length === 0) return 0;
        // 잠금 — 같은 예약을 동시에 반환·교환할 때 한쪽만 이긴다.
        await tx.$queryRaw`
          SELECT id FROM reservations
          WHERE id IN (${Prisma.join(rows.map((r) => r.id))})
          ORDER BY id
          FOR UPDATE`;
        const res = await tx.reservation.updateMany({
          where: {
            id: { in: rows.map((r) => r.id) },
            userIdx: me,
            canceledAt: ACTIVE,
          },
          data: { canceledAt: now },
        });
        if (res.count !== rows.length) {
          throw new AppException(
            ErrorCode.SEAT_STATE_CHANGED,
            "예매 상태가 바뀌었습니다. 다시 시도해 주세요.",
            HttpStatus.CONFLICT,
          );
        }

        // 반환 내역은 운행편마다 1건 (기존 앱은 한 승차권 묶음 단위로 남겼다)
        const byTrip = new Map<bigint, typeof rows>();
        for (const r of rows) {
          byTrip.set(r.tripId, [...(byTrip.get(r.tripId) ?? []), r]);
        }
        for (const group of byTrip.values()) {
          const trip = group[0].trip;
          await this.orderHistories.record(tx, {
            userIdx: me,
            tripId: trip.id,
            reservationOrderId: group[0].orderId,
            startStationForView: trip.depName,
            endStationForView: trip.arrName,
            startDay: trip.depPlandTime.slice(0, 8),
            startDayForView: "",
            trainType: trip.trainType,
            selectAdult: group.filter(
              (r) => r.passengerType === PassengerType.ADULT,
            ).length,
            selectKid: group.filter(
              (r) => r.passengerType === PassengerType.CHILD,
            ).length,
            seatCount: group.length,
            finalPrice: group.reduce((sum, r) => sum + r.price, 0),
            paymentMethod: "반환",
            selectedCard: null,
            isReturn: true,
          });
        }
        return rows.length;
      }, SEAT_TX_OPTIONS),
    );

    if (canceled === 0) {
      throw new AppException(
        ErrorCode.RESERVATION_NOT_FOUND,
        "취소할 수 있는 예매가 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }
    return { canceled };
  }

  private async findOrders(
    where: Prisma.ReservationWhereInput,
  ): Promise<OrderDto[]> {
    const rows = await this.prisma.reservation.findMany({
      where,
      include: { trip: true },
      orderBy: [
        { trip: { depPlandTime: "asc" } },
        { carNo: "asc" },
        { seatId: "asc" },
      ],
    });

    const orders = new Map<string, OrderDto>();
    for (const r of rows) {
      const order =
        orders.get(r.orderId) ??
        orders
          .set(r.orderId, {
            orderId: r.orderId,
            trip: toTripDto(r.trip),
            adult: 0,
            kid: 0,
            totalPrice: 0,
            tickets: [],
          })
          .get(r.orderId)!;
      if (r.passengerType === PassengerType.ADULT) order.adult++;
      else order.kid++;
      order.totalPrice += r.price;
      order.tickets.push({
        reservationId: Number(r.id),
        carNo: r.carNo,
        seatId: r.seatId,
        passengerType: r.passengerType,
        price: r.price,
      });
    }
    return [...orders.values()];
  }
}

/**
 * 총액을 좌석 수로 나눈다. 나머지는 앞 좌석부터 1원씩 얹어 합계가 정확히 보존된다.
 * 일부 좌석만 반환해도 남은 좌석 금액의 합이 실제 결제분과 어긋나지 않게 하기 위함이다.
 */
export function splitPrice(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const rest = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < rest ? 1 : 0));
}

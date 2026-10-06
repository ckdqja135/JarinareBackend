// @role: features/seat
// @rule: 운행편별 좌석 현황(배치도 + 상태) 조회만 담당
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { ACTIVE, SeatState } from "./seat.constants";
import { TripService, toTripDto, type TripDto } from "./trip.service";
import { SeatLayoutService, type SeatSlotDto } from "./seat-layout.service";

export interface SeatStatusDto extends SeatSlotDto {
  state: SeatState;
}

export interface CarSeatsDto {
  trip: TripDto;
  carNo: number;
  rowCount: number;
  columns: string[][];
  totalSeats: number;
  availableCount: number;
  /** 이 호차에서 내 선점이 가장 먼저 풀리는 시각 — 결제 타이머용 */
  myHoldExpiresAt: string | null;
  seats: SeatStatusDto[];
}

export interface CarSummaryDto {
  carNo: number;
  totalSeats: number;
  reserved: number;
  held: number;
  available: number;
}

@Injectable()
export class SeatQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripService,
    private readonly layouts: SeatLayoutService,
  ) {}

  /**
   * 호차 좌석 현황. 다른 사람이 누군지는 내려주지 않고 상태만 준다.
   * 예매가 선점보다 우선이다 — 예매 확정 직후 같은 좌석에 늦은 선점이 잠깐
   * 남아 있을 수 있는데, 그 좌석은 이미 팔린 것이다.
   */
  async getCarSeats(
    tripId: number,
    carNo: number,
    user: AuthUser,
  ): Promise<CarSeatsDto> {
    const trip = await this.trips.get(tripId);
    const car = await this.layouts.getCar(trip.trainType, carNo);
    const me = BigInt(user.idx);
    const now = new Date();

    const [reservations, holds] = await Promise.all([
      this.prisma.reservation.findMany({
        where: { tripId: trip.id, carNo, canceledAt: ACTIVE },
        select: { seatId: true, userIdx: true },
      }),
      this.prisma.seatHold.findMany({
        where: { tripId: trip.id, carNo, expiresAt: { gt: now } },
        select: { seatId: true, userIdx: true, expiresAt: true },
      }),
    ]);

    const reservedBy = new Map(reservations.map((r) => [r.seatId, r.userIdx]));
    const heldBy = new Map(holds.map((h) => [h.seatId, h.userIdx]));
    const myHolds = holds.filter((h) => h.userIdx === me);

    const seats = car.seats.map((slot): SeatStatusDto => {
      const owner = reservedBy.get(slot.seatId);
      if (owner !== undefined) {
        return {
          ...slot,
          state: owner === me ? SeatState.MINE : SeatState.RESERVED,
        };
      }
      const holder = heldBy.get(slot.seatId);
      if (holder !== undefined) {
        return {
          ...slot,
          state: holder === me ? SeatState.HELD_BY_ME : SeatState.HELD,
        };
      }
      return { ...slot, state: SeatState.AVAILABLE };
    });

    return {
      trip: toTripDto(trip),
      carNo,
      rowCount: car.rowCount,
      columns: car.columns,
      totalSeats: car.totalSeats,
      availableCount: seats.filter((s) => s.state === SeatState.AVAILABLE)
        .length,
      myHoldExpiresAt:
        myHolds.length > 0
          ? new Date(
              Math.min(...myHolds.map((h) => h.expiresAt.getTime())),
            ).toISOString()
          : null,
      seats,
    };
  }

  /** 호차별 잔여석 — 기존 프론트의 호차 선택 버튼에 붙는 숫자다. 호차 수와 무관하게 쿼리 2번. */
  async getTripSummary(
    tripId: number,
  ): Promise<{ trip: TripDto; cars: CarSummaryDto[] }> {
    const trip = await this.trips.get(tripId);
    const cars = await this.layouts.getCars(trip.trainType);
    const now = new Date();

    const [reserved, held] = await Promise.all([
      this.prisma.reservation.groupBy({
        by: ["carNo"],
        where: { tripId: trip.id, canceledAt: ACTIVE },
        _count: { _all: true },
      }),
      this.prisma.seatHold.groupBy({
        by: ["carNo"],
        where: { tripId: trip.id, expiresAt: { gt: now } },
        _count: { _all: true },
      }),
    ]);
    const reservedOf = new Map(reserved.map((r) => [r.carNo, r._count._all]));
    const heldOf = new Map(held.map((h) => [h.carNo, h._count._all]));

    return {
      trip: toTripDto(trip),
      cars: cars.map((c) => {
        const r = reservedOf.get(c.carNo) ?? 0;
        const h = heldOf.get(c.carNo) ?? 0;
        return {
          carNo: c.carNo,
          totalSeats: c.totalSeats,
          reserved: r,
          held: h,
          // 예매 직후 남은 늦은 선점이 예매 좌석과 겹칠 수 있어 음수가 되지 않게 막는다.
          available: Math.max(0, c.totalSeats - r - h),
        };
      }),
    };
  }
}

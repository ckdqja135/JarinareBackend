import { HttpStatus } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { ReservationService, splitPrice } from "./reservation.service";
import { SeatQueryService } from "./seat-query.service";
import { SeatLayoutService } from "./seat-layout.service";
import { TripService } from "./trip.service";
import { SeatHoldService } from "./seat-hold.service";
import { isUniqueViolation, withDeadlockRetry } from "./seat-db.util";
import { ageBucket } from "../travel-stat/travel-stat.service";
import { PointService } from "../point/point.service";
import { DEFAULT_LAYOUT, SeatState } from "./seat.constants";

const user = (idx: number): AuthUser => ({
  idx,
  email: `${idx}@t`,
  role: "user",
});

const TRIP = {
  id: 7n,
  trainNo: "101",
  trainType: "00",
  depPlaceId: "A",
  arrPlaceId: "B",
  depPlandTime: "202610100900",
  arrPlandTime: "202610101130",
  depName: "서울",
  arrName: "부산",
  createdAt: new Date(),
};

/** 2행 × A B | C D 배치 */
const CAR = {
  carNo: 1,
  rowCount: 2,
  totalSeats: 8,
  columns: [
    ["A", "B"],
    ["C", "D"],
  ],
  seats: ["A1", "B1", "C1", "D1", "A2", "B2", "C2", "D2"].map((seatId) => ({
    seatId,
    rowNo: Number(seatId[1]),
    colLabel: seatId[0],
    side: seatId[0] < "C" ? "left" : "right",
    isWindow: seatId[0] === "A" || seatId[0] === "D",
  })),
};

describe("splitPrice", () => {
  it.each([
    [100000, 3],
    [1, 2],
    [0, 4],
    [99999, 8],
  ])(
    "총액 %d 을 %d 석으로 나눠도 합계가 보존되고 좌석 간 차이는 1원 이하",
    (total, n) => {
      const parts = splitPrice(total, n);
      expect(parts).toHaveLength(n);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
      expect(Math.max(...parts) - Math.min(...parts)).toBeLessThanOrEqual(1);
    },
  );
});

describe("SeatQueryService.getCarSeats", () => {
  const ME = 1n;
  const OTHER = 2n;

  function build(
    reservations: { seatId: string; userIdx: bigint }[],
    holds: { seatId: string; userIdx: bigint; expiresAt: Date }[],
  ) {
    const prisma = {
      reservation: { findMany: jest.fn().mockResolvedValue(reservations) },
      seatHold: { findMany: jest.fn().mockResolvedValue(holds) },
    };
    const trips = {
      get: jest.fn().mockResolvedValue(TRIP),
    } as unknown as TripService;
    const layouts = {
      getCar: jest.fn().mockResolvedValue(CAR),
    } as unknown as SeatLayoutService;
    return {
      prisma,
      service: new SeatQueryService(prisma as never, trips, layouts),
    };
  }

  it("예매·선점 주인에 따라 다섯 가지 상태를 구분한다", async () => {
    const soon = new Date(Date.now() + 60_000);
    const { service } = build(
      [
        { seatId: "A1", userIdx: ME },
        { seatId: "B1", userIdx: OTHER },
      ],
      [
        { seatId: "C1", userIdx: ME, expiresAt: soon },
        { seatId: "D1", userIdx: OTHER, expiresAt: soon },
      ],
    );
    const res = await service.getCarSeats(7, 1, user(1));
    const state = Object.fromEntries(res.seats.map((s) => [s.seatId, s.state]));

    expect(state).toMatchObject({
      A1: SeatState.MINE,
      B1: SeatState.RESERVED,
      C1: SeatState.HELD_BY_ME,
      D1: SeatState.HELD,
      A2: SeatState.AVAILABLE,
    });
    expect(res.availableCount).toBe(4);
    expect(res.myHoldExpiresAt).toBe(soon.toISOString());
  });

  it("같은 좌석에 예매와 늦은 선점이 함께 있으면 예매가 이긴다", async () => {
    const { service } = build(
      [{ seatId: "A1", userIdx: OTHER }],
      [{ seatId: "A1", userIdx: ME, expiresAt: new Date(Date.now() + 60_000) }],
    );
    const res = await service.getCarSeats(7, 1, user(1));
    expect(res.seats.find((s) => s.seatId === "A1")?.state).toBe(
      SeatState.RESERVED,
    );
    expect(res.myHoldExpiresAt).not.toBeNull();
  });

  it("만료된 선점은 조회 조건(expiresAt > now)으로 걸러진다", async () => {
    const { prisma, service } = build([], []);
    const before = Date.now();
    await service.getCarSeats(7, 1, user(1));
    const where = prisma.seatHold.findMany.mock.calls[0][0].where;
    expect(where.expiresAt.gt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("SeatLayoutService", () => {
  const layoutRow = (trainType: string) => ({
    id: 1,
    trainType,
    carNo: 1,
    rowCount: 1,
    totalSeats: 2,
    seats: [
      { seatId: "A1", rowNo: 1, colLabel: "A", side: "left", isWindow: true },
      { seatId: "C1", rowNo: 1, colLabel: "C", side: "right", isWindow: false },
    ],
  });

  it("열차 종류 전용 배치가 없으면 기본 배치로 떨어지고, 결과를 캐시한다", async () => {
    const findMany = jest.fn(({ where }: { where: { trainType: string } }) =>
      Promise.resolve(
        where.trainType === DEFAULT_LAYOUT ? [layoutRow(DEFAULT_LAYOUT)] : [],
      ),
    );
    const service = new SeatLayoutService({ carLayout: { findMany } } as never);

    const cars = await service.getCars("00");
    expect(cars[0].columns).toEqual([["A"], ["C"]]);
    await service.getCars("00");
    expect(findMany).toHaveBeenCalledTimes(2); // "00" 1회 + DEFAULT 1회, 두 번째 호출은 캐시
  });

  it("배치도에 없는 좌석 번호는 400 SEAT_NOT_FOUND", async () => {
    const service = new SeatLayoutService({
      carLayout: { findMany: jest.fn().mockResolvedValue([layoutRow("00")]) },
    } as never);
    await expect(
      service.assertSeatsExist("00", 1, ["A1", "Z9"]),
    ).rejects.toMatchObject({
      code: ErrorCode.SEAT_NOT_FOUND,
      status: HttpStatus.BAD_REQUEST,
    });
  });
});

describe("ReservationService.create", () => {
  it("인원 합이 좌석 수와 다르면 DB 에 가기 전에 400", async () => {
    const prisma = { $transaction: jest.fn() };
    const service = new ReservationService(
      prisma as never,
      {} as TripService,
      {} as SeatLayoutService,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(
      service.create(
        {
          tripId: 7,
          carNo: 1,
          seatIds: ["A1", "B1"],
          adult: 1,
          kid: 0,
          totalPrice: 10,
        },
        user(1),
      ),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("UNIQUE 위반은 409 SEAT_ALREADY_RESERVED 로 바뀐다", async () => {
    const dup = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "x",
    });
    const prisma = { $transaction: jest.fn().mockRejectedValue(dup) };
    const trips = {
      get: jest.fn().mockResolvedValue(TRIP),
    } as unknown as TripService;
    const layouts = {
      assertSeatsExist: jest.fn(),
    } as unknown as SeatLayoutService;
    const service = new ReservationService(
      prisma as never,
      trips,
      layouts,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.create(
        {
          tripId: 7,
          carNo: 1,
          seatIds: ["A1"],
          adult: 1,
          kid: 0,
          totalPrice: 10,
        },
        user(1),
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.SEAT_ALREADY_RESERVED,
      status: HttpStatus.CONFLICT,
    });
  });
});

describe("SeatHoldService.hold", () => {
  function build(tryHold: (seatId: string) => boolean) {
    const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
    const prisma = {
      reservation: { findMany: jest.fn().mockResolvedValue([]) },
      seatHold: { findMany: jest.fn().mockResolvedValue([]), deleteMany },
    };
    const trips = {
      get: jest.fn().mockResolvedValue(TRIP),
    } as unknown as TripService;
    const layouts = {
      assertSeatsExist: jest.fn(),
    } as unknown as SeatLayoutService;
    const service = new SeatHoldService(prisma as never, trips, layouts);
    const order: string[] = [];
    jest.spyOn(service, "tryHold").mockImplementation((_t, _c, seatId) => {
      order.push(seatId);
      return Promise.resolve(tryHold(seatId));
    });
    return { service, deleteMany, order };
  }

  it("좌석을 정렬된 순서로 잡는다 — 겹치는 좌석을 노리는 두 사람이 같은 곳에서 부딪히게", async () => {
    const { service, order } = build(() => true);
    await service.hold(
      { tripId: 7, carNo: 1, seatIds: ["C1", "A1", "B1"] },
      user(1),
    );
    expect(order).toEqual(["A1", "B1", "C1"]);
  });

  it("하나라도 못 잡으면 이번에 잡은 좌석만 되돌리고 409 SEAT_LOCKED", async () => {
    const { service, deleteMany } = build((seatId) => seatId !== "B1");
    const err = await service
      .hold({ tripId: 7, carNo: 1, seatIds: ["A1", "B1", "C1"] }, user(1))
      .catch((e: AppException) => e);

    expect(err).toBeInstanceOf(AppException);
    expect((err as AppException).code).toBe(ErrorCode.SEAT_LOCKED);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { tripId: 7n, carNo: 1, seatId: { in: ["A1"] }, userIdx: 1n },
    });
  });
});

describe("seat-db.util", () => {
  it("교착은 재시도하고, 비즈니스 오류는 재시도하지 않는다", async () => {
    const deadlock = new Prisma.PrismaClientKnownRequestError("deadlock", {
      code: "P2034",
      clientVersion: "x",
    });
    const flaky = jest
      .fn()
      .mockRejectedValueOnce(deadlock)
      .mockResolvedValue("ok");
    await expect(withDeadlockRetry(flaky)).resolves.toBe("ok");
    expect(flaky).toHaveBeenCalledTimes(2);

    const business = jest
      .fn()
      .mockRejectedValue(new AppException(ErrorCode.SEAT_LOCKED, "x"));
    await expect(withDeadlockRetry(business)).rejects.toBeInstanceOf(
      AppException,
    );
    expect(business).toHaveBeenCalledTimes(1);
  });

  it("UNIQUE 위반은 모델 쿼리(P2002)와 raw 쿼리(1062) 둘 다 알아본다", () => {
    expect(
      isUniqueViolation(
        new Prisma.PrismaClientKnownRequestError("x", {
          code: "P2002",
          clientVersion: "x",
        }),
      ),
    ).toBe(true);
    expect(
      isUniqueViolation(new Error("Duplicate entry '7-1-A1' for key")),
    ).toBe(true);
    expect(isUniqueViolation(new Error("something else"))).toBe(false);
  });
});

describe("ageBucket — users.age(숫자)를 기존 통계 화면의 나이대 칸으로", () => {
  it.each([
    [null, null],
    [9, "10대"],
    [15, "10대"],
    [20, "20대"],
    [27, "20대"],
    [59, "50대"],
    [60, "60대+"],
    [83, "60대+"],
  ])("%s → %s", (age, expected) => {
    expect(ageBucket(age)).toBe(expected);
  });
});

describe("PointService", () => {
  function tx(balance: number, count = 0) {
    return {
      $queryRaw: jest
        .fn()
        .mockResolvedValue([{ point: balance, seatChageCount: count }]),
      user: { update: jest.fn() },
      pointHistory: { create: jest.fn() },
    };
  }

  it("보유 포인트보다 많이 쓰면 400 INSUFFICIENT_POINT, 잔액은 건드리지 않는다", async () => {
    const t = tx(500);
    await expect(
      new PointService({} as never).applyPayment(t as never, 1n, 1000, 0),
    ).rejects.toMatchObject({ code: ErrorCode.INSUFFICIENT_POINT });
    expect(t.user.update).not.toHaveBeenCalled();
  });

  it("사용·페이백은 덮어쓰기가 아니라 증감으로 반영한다", async () => {
    const t = tx(5000);
    await new PointService({} as never).applyPayment(t as never, 1n, 1000, 300);
    expect(t.user.update).toHaveBeenCalledWith({
      where: { idx: 1n },
      data: { point: { increment: -700 } },
    });
  });

  it("교환 5회째에만 2000P 와 적립 내역을 남긴다", async () => {
    const fourth = tx(0, 3);
    await new PointService({} as never).rewardSeatChange(fourth as never, 1n);
    expect(fourth.user.update).toHaveBeenCalledWith({
      where: { idx: 1n },
      data: { seatChageCount: 4, point: { increment: 0 } },
    });
    expect(fourth.pointHistory.create).not.toHaveBeenCalled();

    const fifth = tx(0, 4);
    await new PointService({} as never).rewardSeatChange(fifth as never, 1n);
    expect(fifth.user.update).toHaveBeenCalledWith({
      where: { idx: 1n },
      data: { seatChageCount: 5, point: { increment: 2000 } },
    });
    expect(fifth.pointHistory.create).toHaveBeenCalledWith({
      data: { userIdx: 1n, amount: 2000, reason: "SEAT_CHANGE_REWARD" },
    });
  });
});

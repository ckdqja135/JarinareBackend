// @role: features/seat
// @rule: 좌석 변경(빈 좌석 이동 · 일행 교환 신청/수락/거절/철회)만 담당
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { NotificationService } from "../notification/notification.service";
import {
  ACTIVE,
  CHANGE_REQUEST_TTL_MS,
  ChangeRequestStatus,
  HOLD_TTL_MS,
} from "./seat.constants";
import {
  SEAT_TX_OPTIONS,
  isUniqueViolation,
  toBigInt,
  withDeadlockRetry,
} from "./seat-db.util";
import { toTripDto, type TripDto } from "./trip.service";
import { SeatLayoutService } from "./seat-layout.service";
import { SeatHoldService } from "./seat-hold.service";
import { PointService } from "../point/point.service";
import type { CreateChangeRequestDto } from "./dto/seat.dto";

export interface SeatRef {
  carNo: number;
  seatId: string;
}

/** 신청 시점에 찍어 두는 좌석 스냅샷 */
interface SeatSnapshot extends SeatRef {
  reservationId: number;
}

export interface ChangeRequestDto {
  requestId: number;
  trip: TripDto;
  status: string;
  /** 신청자 좌석 */
  from: SeatRef[];
  /** 상대 일행 좌석 */
  to: SeatRef[];
  /** 신청자가 함께 옮겨 갈 빈 좌석 */
  empty: SeatRef[];
  requesterName: string;
  targetName: string;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
}

export type ChangeResultDto =
  | { status: "MOVED"; seats: SeatRef[] }
  | { status: "PENDING"; request: ChangeRequestDto };

/** 잠근 상태로 읽은 신청 행 */
interface LockedRequest {
  id: unknown;
  tripId: unknown;
  status: string;
  expiresAt: Date;
  requesterIdx: unknown;
  targetIdx: unknown;
  fromSeats: unknown;
  toSeats: unknown;
  emptySeats: unknown;
}

/** 잠근 상태로 읽은 예약 행 */
interface LockedReservation {
  id: unknown;
  userIdx: unknown;
  carNo: number;
  seatId: string;
  orderId: string;
  passengerType: string;
  price: number;
}

/** 트랜잭션 안에서 상태를 바꾼 뒤 커밋하고, 그 결과로 오류를 낼 때 쓴다 */
type Outcome = { ok: true } | { ok: false; error: AppException };

type TxClient = Prisma.TransactionClient;

/**
 * 좌석 변경.
 *
 * 영화 예매에는 없는 자리나래 고유 흐름이고, 기존 앱처럼 "함께 예매한 일행 좌석은 같이 움직인다".
 * 내 좌석 N석을 옮길 곳으로 N석을 고르면,
 * - 전부 빈 좌석이면: 신청 없이 바로 옮긴다 (선점 → 이동 → 선점 해제, 예매와 같은 줄에 선다)
 * - 남의 일행 좌석 M석(M ≤ N)이 섞여 있으면: 그 사람에게 교환을 신청한다.
 *   수락되면 나는 그 M석 + 빈 좌석 N−M석으로, 상대는 내 좌석 중 M석으로 가고, 남는 내 좌석은 비워진다.
 *   상대 일행을 쪼개지 않도록, 그 사람 일행 좌석은 전부 골라야 한다.
 *
 * 교환이 성사되면 기존 앱(useHandleChange)처럼 수락한 사람의 변경 횟수를 올리고
 * 5회째마다 2000P 를 준다. 교환과 같은 트랜잭션이라 보상만 빠지는 일이 없다.
 *
 * 잠금 순서는 모든 경로에서 "신청 → 예약(id 오름차순) → 선점 → 사용자" 다.
 * 이 순서를 거스르는 경로가 없어야 두 트랜잭션이 서로를 기다리는 원형 대기가 생기지 않는다.
 */
@Injectable()
export class SeatChangeService {
  private readonly logger = new Logger(SeatChangeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly layouts: SeatLayoutService,
    private readonly holds: SeatHoldService,
    private readonly notifications: NotificationService,
    private readonly points: PointService,
  ) {}

  async request(
    dto: CreateChangeRequestDto,
    user: AuthUser,
  ): Promise<ChangeResultDto> {
    const me = BigInt(user.idx);
    const ids = dto.reservationIds.map((id) => BigInt(id));
    const mine = await this.prisma.reservation.findMany({
      where: { id: { in: ids }, userIdx: me, canceledAt: ACTIVE },
      include: { trip: true },
    });
    if (mine.length !== ids.length) {
      throw new AppException(
        ErrorCode.RESERVATION_NOT_FOUND,
        "변경할 수 있는 예매가 아닙니다.",
        HttpStatus.NOT_FOUND,
      );
    }
    const trip = mine[0].trip;
    if (mine.some((r) => r.tripId !== trip.id)) {
      throw badRequest("같은 열차의 좌석만 함께 옮길 수 있습니다.");
    }
    const toSeatIds = [...new Set(dto.toSeatIds)];
    if (toSeatIds.length !== mine.length) {
      throw badRequest(
        `옮길 좌석 수(${mine.length}석)만큼 좌석을 골라 주세요. 지금 ${toSeatIds.length}석입니다.`,
      );
    }
    await this.layouts.assertSeatsExist(trip.trainType, dto.toCarNo, toSeatIds);
    if (
      mine.some((r) => r.carNo === dto.toCarNo && toSeatIds.includes(r.seatId))
    ) {
      throw badRequest("지금 내 좌석은 옮겨 갈 좌석으로 고를 수 없습니다.");
    }

    const occupants = await this.prisma.reservation.findMany({
      where: {
        tripId: trip.id,
        carNo: dto.toCarNo,
        seatId: { in: toSeatIds },
        canceledAt: ACTIVE,
      },
    });

    if (occupants.length === 0) {
      const seats = await this.moveGroup(
        trip.id,
        mine.map((r) => r.id),
        dto.toCarNo,
        toSeatIds,
        me,
      );
      return { status: "MOVED", seats };
    }

    if (occupants.some((o) => o.userIdx === me)) {
      throw badRequest("이미 내가 예매한 좌석이 포함되어 있습니다.");
    }
    const targetIdx = occupants[0].userIdx;
    if (occupants.some((o) => o.userIdx !== targetIdx)) {
      throw badRequest("한 번에 한 일행의 좌석과만 바꿀 수 있습니다.");
    }
    // 상대 일행을 쪼개지 않는다 — 고른 좌석이 속한 묶음의 좌석이 전부 골라져 있어야 한다.
    const group = await this.prisma.reservation.count({
      where: {
        tripId: trip.id,
        userIdx: targetIdx,
        orderId: { in: [...new Set(occupants.map((o) => o.orderId))] },
        canceledAt: ACTIVE,
      },
    });
    if (group !== occupants.length) {
      throw badRequest(
        `상대 일행 좌석 ${group}석을 모두 골라 주세요. 지금 ${occupants.length}석입니다.`,
      );
    }

    const now = new Date();
    const pending = await this.prisma.seatChangeRequest.findFirst({
      where: {
        tripId: trip.id,
        requesterIdx: me,
        targetIdx,
        status: ChangeRequestStatus.PENDING,
        expiresAt: { gt: now },
      },
      select: { id: true },
    });
    if (pending) {
      throw new AppException(
        ErrorCode.CONFLICT,
        "이 일행에게 보낸 교환 신청이 아직 응답을 기다리고 있습니다.",
        HttpStatus.CONFLICT,
      );
    }

    const occupied = new Set(occupants.map((o) => o.seatId));
    const emptySeatIds = toSeatIds.filter((s) => !occupied.has(s)).sort(bySeat);
    const expiresAt = new Date(now.getTime() + CHANGE_REQUEST_TTL_MS);

    // 함께 옮겨 갈 빈 좌석은 신청이 살아 있는 동안 내 몫으로 잡아 둔다 (기존 앱의 RTDB 잠금).
    await this.holds.acquireAll(
      trip.id,
      dto.toCarNo,
      emptySeatIds,
      me,
      now,
      expiresAt,
    );

    let requestId: bigint;
    try {
      const created = await this.prisma.seatChangeRequest.create({
        data: {
          tripId: trip.id,
          requesterIdx: me,
          targetIdx,
          fromSeats: toSnapshots(mine) as unknown as Prisma.InputJsonValue,
          toSeats: toSnapshots(occupants) as unknown as Prisma.InputJsonValue,
          emptySeats: emptySeatIds.map((seatId) => ({
            carNo: dto.toCarNo,
            seatId,
          })),
          expiresAt,
        },
      });
      requestId = created.id;
    } catch (e) {
      await this.holds.releaseSeats(trip.id, dto.toCarNo, emptySeatIds, me);
      throw e;
    }

    const request = (await this.findRequests({ id: requestId }))[0];
    const target = await this.prisma.user.findUnique({
      where: { idx: targetIdx },
      select: { notifiChange: true },
    });
    // notifiChange 는 "좌석 변경 알림" 수신 설정이다.
    if (target?.notifiChange) {
      this.notifications.create(targetIdx, "seat_change_request", {
        requestId: request.requestId,
        tripId: request.trip.tripId,
        trainNo: request.trip.trainNo,
        from: request.from,
        to: request.to,
        empty: request.empty,
        requesterName: request.requesterName,
        expiresAt: request.expiresAt,
      });
    }
    return { status: "PENDING", request };
  }

  /**
   * 일행 전체를 빈 좌석으로 옮긴다.
   *
   * 목적 좌석을 먼저 전부 선점한다. 그 좌석을 결제 중인 사람이 있으면 SEAT_LOCKED 로
   * 비키고, 반대로 내가 옮기는 중이면 그 좌석을 남이 결제하지 못한다.
   * 그 사이 누가 이미 예매를 끝냈다면 UNIQUE 가 막는다.
   * 목적 좌석에 내 좌석이 없으므로 옮기는 도중 내 예약끼리 부딪히지 않는다.
   */
  private async moveGroup(
    tripId: bigint,
    reservationIds: bigint[],
    toCarNo: number,
    toSeatIds: string[],
    me: bigint,
  ): Promise<SeatRef[]> {
    const now = new Date();
    await this.holds.acquireAll(
      tripId,
      toCarNo,
      toSeatIds,
      me,
      now,
      new Date(now.getTime() + HOLD_TTL_MS),
    );

    try {
      await withDeadlockRetry(() =>
        this.prisma.$transaction(async (tx) => {
          const rows = await tx.$queryRaw<LockedReservation[]>`
            SELECT id, userIdx, carNo, seatId, orderId, passengerType, price
            FROM reservations
            WHERE id IN (${Prisma.join(reservationIds)})
              AND userIdx = ${me} AND canceledAt = ${ACTIVE}
            ORDER BY id
            FOR UPDATE`;
          if (rows.length !== reservationIds.length) {
            throw stateChanged("예매 상태가 바뀌었습니다. 다시 시도해 주세요.");
          }
          const targets = [...toSeatIds].sort(bySeat);
          const ordered = [...rows].sort(byCarSeat);
          for (let i = 0; i < ordered.length; i++) {
            await tx.reservation.update({
              where: { id: toBigInt(ordered[i].id) },
              data: { carNo: toCarNo, seatId: targets[i] },
            });
          }
        }, SEAT_TX_OPTIONS),
      );
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new AppException(
          ErrorCode.SEAT_ALREADY_RESERVED,
          "고른 좌석 중 방금 다른 사용자가 예매한 좌석이 있습니다.",
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    } finally {
      await this.holds.releaseSeats(tripId, toCarNo, toSeatIds, me);
    }
    return [...toSeatIds]
      .sort(bySeat)
      .map((seatId) => ({ carNo: toCarNo, seatId }));
  }

  /**
   * 교환 수락.
   *
   * 신청 → 관련 예약 전부(id 오름차순) → 빈 좌석 선점 순으로 잠그고, 신청 당시와
   * 그대로인지 확인한 뒤 바꾼다.
   *
   * 맞바꾸는 좌석은 좌석 번호가 아니라 "주인" 을 바꾼다. MySQL 은 UNIQUE 를 행 단위로
   * 즉시 검사하므로 A→B 를 먼저 바꾸는 순간 B 의 활성 예약이 2건이 되어 실패한다.
   * 좌석은 그대로 두고 주인(userIdx)과 그 사람의 티켓 정보(묶음·권종·금액)를 옮기면
   * UNIQUE 에 닿지 않는다. 빈 좌석으로 가는 나머지 내 좌석만 좌석 번호를 바꾼다.
   */
  async accept(requestId: number, user: AuthUser): Promise<ChangeRequestDto> {
    const me = BigInt(user.idx);
    const now = new Date();

    let outcome: Outcome;
    try {
      outcome = await withDeadlockRetry(() =>
        this.prisma.$transaction(async (tx): Promise<Outcome> => {
          const req = await this.lockRequest(tx, requestId, { targetIdx: me });
          const closed = await this.closeIfNotPending(tx, req, now);
          if (closed) return { ok: false, error: closed };

          const requester = toBigInt(req.requesterIdx);
          const fromSnap = parseSnapshots(req.fromSeats);
          const toSnap = parseSnapshots(req.toSeats);
          const empty = parseSeatRefs(req.emptySeats);

          const ids = [...fromSnap, ...toSnap].map((s) =>
            BigInt(s.reservationId),
          );
          const rows = await tx.$queryRaw<LockedReservation[]>`
            SELECT id, userIdx, carNo, seatId, orderId, passengerType, price
            FROM reservations
            WHERE id IN (${Prisma.join(ids)}) AND canceledAt = ${ACTIVE}
            ORDER BY id
            FOR UPDATE`;
          const fromRows = matchSnapshots(rows, fromSnap, requester);
          const toRows = matchSnapshots(rows, toSnap, me);
          const emptyHeld = await this.lockEmptyHolds(
            tx,
            req,
            requester,
            empty,
            now,
          );

          if (!fromRows || !toRows || !emptyHeld) {
            await this.setStatus(tx, req, ChangeRequestStatus.CANCELED, now);
            return {
              ok: false,
              error: stateChanged(
                "신청 이후 좌석 상태가 바뀌어 교환할 수 없습니다.",
              ),
            };
          }

          // 상대 일행 → 내 좌석 앞쪽 M석 (일행이 붙어 앉게 좌석 순서대로)
          const mineOrdered = [...fromRows].sort(byCarSeat);
          const theirsOrdered = [...toRows].sort(byCarSeat);
          for (let i = 0; i < theirsOrdered.length; i++) {
            await swapOwners(tx, mineOrdered[i], theirsOrdered[i]);
          }
          // 남는 내 좌석 → 빈 좌석
          const emptyOrdered = [...empty].sort(byCarSeat);
          for (let j = 0; j < emptyOrdered.length; j++) {
            await tx.reservation.update({
              where: { id: toBigInt(mineOrdered[theirsOrdered.length + j].id) },
              data: {
                carNo: emptyOrdered[j].carNo,
                seatId: emptyOrdered[j].seatId,
              },
            });
          }
          await this.deleteEmptyHolds(tx, req, requester, empty);
          await this.setStatus(tx, req, ChangeRequestStatus.ACCEPTED, now);
          await this.points.rewardSeatChange(tx, me);

          return { ok: true };
        }, SEAT_TX_OPTIONS),
      );
    } catch (e) {
      // 빈 좌석 이동이 UNIQUE 에 걸렸다 — 선점을 우회한 예매가 끼어든 극단적인 경우.
      // 트랜잭션은 통째로 롤백됐으므로 신청만 따로 닫는다.
      if (!isUniqueViolation(e)) throw e;
      await this.closeAfterRollback(
        requestId,
        ChangeRequestStatus.CANCELED,
        now,
      );
      outcome = {
        ok: false,
        error: stateChanged("신청 이후 좌석 상태가 바뀌어 교환할 수 없습니다."),
      };
    }

    if (!outcome.ok) {
      await this.releaseRequestHolds(requestId);
      throw outcome.error;
    }
    const request = (await this.findRequests({ id: BigInt(requestId) }))[0];
    await this.notifyRequester(request, "seat_change_accepted");
    return request;
  }

  async reject(requestId: number, user: AuthUser): Promise<ChangeRequestDto> {
    const request = await this.respond(
      requestId,
      { targetIdx: BigInt(user.idx) },
      ChangeRequestStatus.REJECTED,
    );
    await this.notifyRequester(request, "seat_change_rejected");
    return request;
  }

  /** 신청자가 응답 전에 철회한다. */
  cancel(requestId: number, user: AuthUser): Promise<ChangeRequestDto> {
    return this.respond(
      requestId,
      { requesterIdx: BigInt(user.idx) },
      ChangeRequestStatus.CANCELED,
    );
  }

  /** 받은 신청 / 보낸 신청. 만료 크론이 돌기 전이라도 시간이 지난 건 EXPIRED 로 보여 준다. */
  list(box: "received" | "sent", user: AuthUser): Promise<ChangeRequestDto[]> {
    const me = BigInt(user.idx);
    return this.findRequests(
      box === "received" ? { targetIdx: me } : { requesterIdx: me },
    );
  }

  /**
   * 응답 없이 지난 신청을 EXPIRED 로 닫는다. 빈 좌석 선점은 신청과 같은 시각에
   * 만료되므로 따로 풀 필요가 없다. 같은 행을 같은 값으로 바꿀 뿐이라
   * 여러 인스턴스가 동시에 돌아도 된다.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async expireStale(): Promise<number> {
    try {
      const res = await this.prisma.seatChangeRequest.updateMany({
        where: {
          status: ChangeRequestStatus.PENDING,
          expiresAt: { lt: new Date() },
        },
        data: { status: ChangeRequestStatus.EXPIRED },
      });
      return res.count;
    } catch (e) {
      this.logger.warn(`만료 신청 정리 실패: ${String(e)}`);
      return 0;
    }
  }

  /** 거절·철회 공통: 신청 행 하나만 잠그고 상태를 바꾼 뒤, 잡아 둔 빈 좌석을 놓는다. */
  private async respond(
    requestId: number,
    owner: { targetIdx: bigint } | { requesterIdx: bigint },
    status: ChangeRequestStatus,
  ): Promise<ChangeRequestDto> {
    const now = new Date();
    const outcome = await withDeadlockRetry(() =>
      this.prisma.$transaction(async (tx): Promise<Outcome> => {
        const req = await this.lockRequest(tx, requestId, owner);
        const closed = await this.closeIfNotPending(tx, req, now);
        if (closed) return { ok: false, error: closed };
        await this.setStatus(tx, req, status, now);
        return { ok: true };
      }, SEAT_TX_OPTIONS),
    );
    await this.releaseRequestHolds(requestId);
    if (!outcome.ok) throw outcome.error;
    return (await this.findRequests({ id: BigInt(requestId) }))[0];
  }

  private async lockRequest(
    tx: TxClient,
    requestId: number,
    owner: { targetIdx: bigint } | { requesterIdx: bigint },
  ): Promise<LockedRequest> {
    const rows = await tx.$queryRaw<LockedRequest[]>`
      SELECT id, tripId, status, expiresAt, requesterIdx, targetIdx,
             fromSeats, toSeats, emptySeats
      FROM seat_change_requests
      WHERE id = ${BigInt(requestId)}
      FOR UPDATE`;
    const req = rows[0];
    const isOwner =
      req !== undefined &&
      ("targetIdx" in owner
        ? toBigInt(req.targetIdx) === owner.targetIdx
        : toBigInt(req.requesterIdx) === owner.requesterIdx);
    if (!isOwner) {
      throw new AppException(
        ErrorCode.SEAT_CHANGE_REQUEST_NOT_FOUND,
        "좌석 교환 신청을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }
    return req;
  }

  /** 함께 옮겨 갈 빈 좌석이 아직 신청자 몫으로 잡혀 있는지 — 잠가서 확인한다. */
  private async lockEmptyHolds(
    tx: TxClient,
    req: LockedRequest,
    requester: bigint,
    empty: SeatRef[],
    now: Date,
  ): Promise<boolean> {
    if (empty.length === 0) return true;
    const rows = await tx.$queryRaw<{ id: unknown }[]>`
      SELECT id FROM seat_holds
      WHERE tripId = ${toBigInt(req.tripId)} AND userIdx = ${requester}
        AND expiresAt > ${now}
        AND (carNo, seatId) IN (${Prisma.join(
          empty.map((s) => Prisma.sql`(${s.carNo}, ${s.seatId})`),
        )})
      ORDER BY id
      FOR UPDATE`;
    return rows.length === empty.length;
  }

  private async deleteEmptyHolds(
    tx: TxClient,
    req: LockedRequest,
    requester: bigint,
    empty: SeatRef[],
  ): Promise<void> {
    for (const s of empty) {
      await tx.seatHold.deleteMany({
        where: {
          tripId: toBigInt(req.tripId),
          carNo: s.carNo,
          seatId: s.seatId,
          userIdx: requester,
        },
      });
    }
  }

  /** 끝난 신청이 잡아 두었던 빈 좌석을 놓는다. 이미 없으면 아무 일도 없다. */
  private async releaseRequestHolds(requestId: number): Promise<void> {
    const req = await this.prisma.seatChangeRequest.findUnique({
      where: { id: BigInt(requestId) },
      select: {
        tripId: true,
        requesterIdx: true,
        emptySeats: true,
        status: true,
      },
    });
    if (!req || req.status === ChangeRequestStatus.PENDING) return;
    for (const s of parseSeatRefs(req.emptySeats)) {
      await this.holds.releaseSeats(
        req.tripId,
        s.carNo,
        [s.seatId],
        req.requesterIdx,
      );
    }
  }

  /**
   * 이미 처리됐거나 시간이 지난 신청이면 (만료는 EXPIRED 로 기록한 뒤) 낼 오류를 돌려준다.
   * 오류를 트랜잭션 안에서 던지면 EXPIRED 기록까지 롤백되므로, 돌려받아 커밋 후에 던진다.
   */
  private async closeIfNotPending(
    tx: TxClient,
    req: LockedRequest,
    now: Date,
  ): Promise<AppException | null> {
    if (req.status !== ChangeRequestStatus.PENDING) {
      return new AppException(
        ErrorCode.SEAT_CHANGE_REQUEST_ALREADY_PROCESSED,
        `이미 처리된 신청입니다 (${req.status}).`,
        HttpStatus.CONFLICT,
      );
    }
    if (req.expiresAt.getTime() <= now.getTime()) {
      await this.setStatus(tx, req, ChangeRequestStatus.EXPIRED, now);
      return new AppException(
        ErrorCode.SEAT_CHANGE_REQUEST_ALREADY_PROCESSED,
        "응답 시간이 지난 신청입니다.",
        HttpStatus.CONFLICT,
      );
    }
    return null;
  }

  private async setStatus(
    tx: TxClient,
    req: LockedRequest,
    status: ChangeRequestStatus,
    now: Date,
  ): Promise<void> {
    await tx.seatChangeRequest.update({
      where: { id: toBigInt(req.id) },
      data: { status, respondedAt: now },
    });
  }

  private async closeAfterRollback(
    requestId: number,
    status: ChangeRequestStatus,
    now: Date,
  ): Promise<void> {
    await this.prisma.seatChangeRequest.updateMany({
      where: { id: BigInt(requestId), status: ChangeRequestStatus.PENDING },
      data: { status, respondedAt: now },
    });
  }

  private async notifyRequester(
    request: ChangeRequestDto,
    type: string,
  ): Promise<void> {
    const row = await this.prisma.seatChangeRequest.findUnique({
      where: { id: BigInt(request.requestId) },
      select: {
        requesterIdx: true,
        requester: { select: { notifiChange: true } },
      },
    });
    if (!row?.requester.notifiChange) return;
    this.notifications.create(row.requesterIdx, type, {
      requestId: request.requestId,
      tripId: request.trip.tripId,
      trainNo: request.trip.trainNo,
      from: request.from,
      to: request.to,
      empty: request.empty,
      targetName: request.targetName,
    });
  }

  private async findRequests(
    where: Prisma.SeatChangeRequestWhereInput,
  ): Promise<ChangeRequestDto[]> {
    const now = Date.now();
    const rows = await this.prisma.seatChangeRequest.findMany({
      where,
      include: {
        trip: true,
        requester: { select: { name: true } },
        target: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((r) => ({
      requestId: Number(r.id),
      trip: toTripDto(r.trip),
      status:
        r.status === ChangeRequestStatus.PENDING && r.expiresAt.getTime() <= now
          ? ChangeRequestStatus.EXPIRED
          : r.status,
      from: parseSnapshots(r.fromSeats).map(toRef),
      to: parseSnapshots(r.toSeats).map(toRef),
      empty: parseSeatRefs(r.emptySeats),
      requesterName: r.requester.name,
      targetName: r.target.name,
      expiresAt: r.expiresAt.toISOString(),
      respondedAt: r.respondedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}

// ── 순수 함수 ───────────────────────────────────────────────────────────────

const badRequest = (message: string) =>
  new AppException(ErrorCode.VALIDATION_ERROR, message, HttpStatus.BAD_REQUEST);

const stateChanged = (message: string) =>
  new AppException(ErrorCode.SEAT_STATE_CHANGED, message, HttpStatus.CONFLICT);

/** "A1" < "B1" < "A2" … — 행 번호 먼저, 같은 행이면 열 순서. 일행이 붙어 앉게 짝을 맞출 때 쓴다. */
export function bySeat(a: string, b: string): number {
  const row = (s: string) => Number(s.slice(1));
  return row(a) - row(b) || a.localeCompare(b);
}

function byCarSeat(a: SeatRef, b: SeatRef): number {
  return a.carNo - b.carNo || bySeat(a.seatId, b.seatId);
}

const toRef = ({ carNo, seatId }: SeatRef): SeatRef => ({ carNo, seatId });

function toSnapshots(
  rows: { id: bigint; carNo: number; seatId: string }[],
): SeatSnapshot[] {
  return rows.map((r) => ({
    reservationId: Number(r.id),
    carNo: r.carNo,
    seatId: r.seatId,
  }));
}

/** JSON 컬럼은 드라이버에 따라 문자열로 올 수 있다 */
function parseJsonArray(v: unknown): unknown[] {
  const value: unknown = typeof v === "string" ? JSON.parse(v) : v;
  return Array.isArray(value) ? value : [];
}

function parseSnapshots(v: unknown): SeatSnapshot[] {
  return parseJsonArray(v).map((x) => {
    const s = x as SeatSnapshot;
    return {
      reservationId: Number(s.reservationId),
      carNo: Number(s.carNo),
      seatId: String(s.seatId),
    };
  });
}

function parseSeatRefs(v: unknown): SeatRef[] {
  return parseJsonArray(v).map((x) => {
    const s = x as SeatRef;
    return { carNo: Number(s.carNo), seatId: String(s.seatId) };
  });
}

/**
 * 스냅샷의 예약이 전부 그대로(활성 · 같은 주인 · 같은 자리)인지 확인하고,
 * 그렇다면 잠근 행들을 스냅샷 순서로 돌려준다. 하나라도 다르면 null.
 */
function matchSnapshots(
  rows: LockedReservation[],
  snaps: SeatSnapshot[],
  owner: bigint,
): LockedReservation[] | null {
  const out: LockedReservation[] = [];
  for (const s of snaps) {
    const r = rows.find((x) => toBigInt(x.id) === BigInt(s.reservationId));
    if (
      !r ||
      toBigInt(r.userIdx) !== owner ||
      r.carNo !== s.carNo ||
      r.seatId !== s.seatId
    ) {
      return null;
    }
    out.push(r);
  }
  return out;
}

/** 두 예약의 주인과 티켓 정보(묶음·권종·금액)를 맞바꾼다. 좌석 번호는 그대로다. */
async function swapOwners(
  tx: TxClient,
  a: LockedReservation,
  b: LockedReservation,
): Promise<void> {
  const owner = (r: LockedReservation) => ({
    userIdx: toBigInt(r.userIdx),
    orderId: r.orderId,
    passengerType: r.passengerType,
    price: r.price,
  });
  await tx.reservation.update({
    where: { id: toBigInt(a.id) },
    data: owner(b),
  });
  await tx.reservation.update({
    where: { id: toBigInt(b.id) },
    data: owner(a),
  });
}

// @role: features/seat
// @rule: 좌석 선점(영화 예매의 "결제 전 좌석 홀드") 획득·해제·만료 정리만 담당
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { ACTIVE, HOLD_TTL_MS, MAX_SEATS_PER_ORDER } from "./seat.constants";
import { toBigInt } from "./seat-db.util";
import { TripService } from "./trip.service";
import { SeatLayoutService } from "./seat-layout.service";
import type { ReleaseHoldDto, SeatSelectionDto } from "./dto/seat.dto";

export interface HoldResultDto {
  tripId: number;
  carNo: number;
  seatIds: string[];
  expiresAt: string;
}

/**
 * 좌석 선점.
 *
 * 선점 성공 여부는 seat_holds 의 UNIQUE(tripId, carNo, seatId) 가 결정한다.
 * "비어 있나 확인 → 넣기" 는 그 사이에 남이 끼어들 수 있어 쓰지 않고,
 * 한 문장짜리 원자적 upsert 의 결과로 판정한다.
 *
 * 여러 좌석은 all-or-nothing 이다. 트랜잭션 하나로 묶으면 좌석마다 잡은 락을
 * 끝까지 들고 있어 교착이 잦으므로, 좌석을 정렬된 순서로 하나씩 잡고 실패하면
 * 이번에 잡은 것만 되돌리는 보상 방식으로 한다. 정렬 덕분에 겹치는 좌석을
 * 노리는 두 사람은 항상 같은 좌석에서 먼저 부딪혀 한쪽만 이긴다.
 */
@Injectable()
export class SeatHoldService {
  private readonly logger = new Logger(SeatHoldService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripService,
    private readonly layouts: SeatLayoutService,
  ) {}

  async hold(dto: SeatSelectionDto, user: AuthUser): Promise<HoldResultDto> {
    const seatIds = [...new Set(dto.seatIds)].sort();
    const trip = await this.trips.get(dto.tripId);
    await this.layouts.assertSeatsExist(trip.trainType, dto.carNo, seatIds);

    const tripId = trip.id;
    const me = BigInt(user.idx);
    // 시각은 항상 앱에서 만든다. DB 의 NOW() 는 KST 벽시계, Prisma 가 쓰는 값은
    // UTC 벽시계라 섞으면 9시간 어긋난다.
    const now = new Date();
    const expiresAt = new Date(now.getTime() + HOLD_TTL_MS);

    // 이미 예매된 좌석은 잡을 이유가 없다. 최종 방어선은 예매 단계의 UNIQUE 지만,
    // 결제 직전까지 가서 실패하는 것보다 여기서 알려 주는 편이 낫다.
    const reserved = await this.prisma.reservation.findMany({
      where: {
        tripId,
        carNo: dto.carNo,
        seatId: { in: seatIds },
        canceledAt: ACTIVE,
      },
      select: { seatId: true },
    });
    if (reserved.length > 0) {
      throw new AppException(
        ErrorCode.SEAT_ALREADY_RESERVED,
        `이미 예매된 좌석입니다: ${reserved.map((r) => r.seatId).join(", ")}`,
        HttpStatus.CONFLICT,
      );
    }

    // 사재기 방지. 동시 요청이면 상한을 살짝 넘을 수 있는 느슨한 제한이다.
    const mine = await this.prisma.seatHold.findMany({
      where: { tripId, userIdx: me, expiresAt: { gt: now } },
      select: { carNo: true, seatId: true },
    });
    const mineKeys = new Set(mine.map((h) => `${h.carNo}:${h.seatId}`));
    const isNew = (seatId: string) => !mineKeys.has(`${dto.carNo}:${seatId}`);
    if (mineKeys.size + seatIds.filter(isNew).length > MAX_SEATS_PER_ORDER) {
      throw new AppException(
        ErrorCode.SEAT_HOLD_LIMIT_EXCEEDED,
        `한 번에 최대 ${MAX_SEATS_PER_ORDER}석까지 선택할 수 있습니다.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.acquireAll(
      tripId,
      dto.carNo,
      seatIds,
      me,
      now,
      expiresAt,
      new Set(seatIds.filter((s) => !isNew(s))),
    );

    return {
      tripId: Number(tripId),
      carNo: dto.carNo,
      seatIds,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * 여러 좌석을 전부 잡거나 하나도 안 잡는다.
   *
   * 좌석 번호 순으로 하나씩 잡고, 실패하면 이번에 새로 잡은 것만 되돌린 뒤
   * SEAT_LOCKED 를 던진다. alreadyMine 은 호출 전부터 내 것이던 좌석으로,
   * 실패해도 놓지 않는다 (같은 좌석을 다시 눌러 연장하다 실패한 경우 등).
   */
  async acquireAll(
    tripId: bigint,
    carNo: number,
    seatIds: string[],
    userIdx: bigint,
    now: Date,
    expiresAt: Date,
    alreadyMine: ReadonlySet<string> = new Set(),
  ): Promise<void> {
    const acquired: string[] = [];
    try {
      for (const seatId of [...seatIds].sort()) {
        const ok = await this.tryHold(
          tripId,
          carNo,
          seatId,
          userIdx,
          now,
          expiresAt,
        );
        if (!ok) {
          throw new AppException(
            ErrorCode.SEAT_LOCKED,
            `${carNo}호차 ${seatId} 좌석은 다른 사용자가 선택 중입니다.`,
            HttpStatus.CONFLICT,
          );
        }
        acquired.push(seatId);
      }
    } catch (e) {
      const fresh = acquired.filter((s) => !alreadyMine.has(s));
      if (fresh.length > 0) {
        await this.releaseSeats(tripId, carNo, fresh, userIdx);
      }
      throw e;
    }
  }

  /** 내가 잡은 특정 좌석들의 선점을 놓는다. */
  async releaseSeats(
    tripId: bigint,
    carNo: number,
    seatIds: string[],
    userIdx: bigint,
  ): Promise<void> {
    if (seatIds.length === 0) return;
    await this.prisma.seatHold.deleteMany({
      where: { tripId, carNo, seatId: { in: seatIds }, userIdx },
    });
  }

  /**
   * 좌석 하나를 원자적으로 잡는다. 내 것이 되면 true.
   *
   * - 행이 없으면 INSERT → 내 것
   * - 있지만 만료됐거나 원래 내 것이면 → 내 것으로 갱신 (만료된 선점 인수)
   * - 남이 유효하게 잡고 있으면 → 아무것도 바꾸지 않음
   *
   * MySQL 은 ON DUPLICATE KEY UPDATE 의 SET 을 왼쪽부터 적용하고, 뒤 식은 앞에서
   * 바뀐 값을 본다. 그래서 조건에 쓰이는 expiresAt 은 맨 마지막에 바꾼다.
   * userIdx 가 먼저 나로 바뀌는 경우는 원래 조건이 참일 때뿐이라 뒤 판정이 흔들리지 않는다.
   *
   * 영향받은 행 수는 드라이버 설정(found rows)에 따라 의미가 달라 믿지 않고,
   * 바로 다시 읽어 주인을 확인한다. 방금 잡은 선점은 7분 동안 남이 가져갈 수 없으므로
   * 이 재조회 사이에 주인이 바뀌지 않는다.
   */
  async tryHold(
    tripId: bigint,
    carNo: number,
    seatId: string,
    userIdx: bigint,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean> {
    await this.prisma.$executeRaw`
      INSERT INTO seat_holds (tripId, carNo, seatId, userIdx, expiresAt, createdAt)
      VALUES (${tripId}, ${carNo}, ${seatId}, ${userIdx}, ${expiresAt}, ${now})
      ON DUPLICATE KEY UPDATE
        userIdx   = IF(expiresAt < ${now} OR userIdx = VALUES(userIdx), VALUES(userIdx), userIdx),
        createdAt = IF(expiresAt < ${now} OR userIdx = VALUES(userIdx), VALUES(createdAt), createdAt),
        expiresAt = IF(expiresAt < ${now} OR userIdx = VALUES(userIdx), VALUES(expiresAt), expiresAt)`;

    const rows = await this.prisma.$queryRaw<{ userIdx: unknown }[]>`
      SELECT userIdx FROM seat_holds
      WHERE tripId = ${tripId} AND carNo = ${carNo} AND seatId = ${seatId}`;
    return rows.length === 1 && toBigInt(rows[0].userIdx) === userIdx;
  }

  /** 내 선점 해제. 호차·좌석을 안 주면 이 운행편의 내 선점을 전부 놓는다. */
  async release(
    dto: ReleaseHoldDto,
    user: AuthUser,
  ): Promise<{ released: number }> {
    const res = await this.prisma.seatHold.deleteMany({
      where: {
        tripId: BigInt(dto.tripId),
        userIdx: BigInt(user.idx),
        ...(dto.carNo !== undefined && { carNo: dto.carNo }),
        ...(dto.seatIds?.length && { seatId: { in: dto.seatIds } }),
      },
    });
    return { released: res.count };
  }

  /**
   * 만료된 선점 청소. 조회·선점 로직은 expiresAt 으로 만료분을 이미 무시하므로
   * 이 작업은 정합성이 아니라 테이블 크기를 위한 것이다. 여러 인스턴스가 동시에
   * 돌아도 같은 행을 지울 뿐이라 분산 락이 필요 없다.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async purgeExpired(): Promise<number> {
    try {
      const res = await this.prisma.seatHold.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      return res.count;
    } catch (e) {
      this.logger.warn(`만료 선점 정리 실패: ${String(e)}`);
      return 0;
    }
  }
}

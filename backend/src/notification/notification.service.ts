// @role: features/notification
// @rule: 알림 저장(도메인 트랜잭션 참여) · 조회 · 파티션 관리
import { HttpStatus, Injectable, MessageEvent } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Observable } from "rxjs";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { SseService } from "./sse.service";
import { NotificationDispatcher } from "./notification-dispatcher.service";
import {
  toNotificationDto,
  type NotificationDto,
  type NotificationRow,
  type NotificationType,
} from "./notification.types";

/** 재연결 시 되돌려 줄 최대 기간 / 건수 */
const REPLAY_LOOKBACK_MS = 24 * 60 * 60_000;
const REPLAY_LIMIT = 200;

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  /**
   * 도메인 트랜잭션 안에서 알림 row 를 만든다.
   * 좋아요·댓글과 같은 트랜잭션이므로 "행동은 성공했는데 알림만 유실" 이 불가능하고,
   * 별도 큐가 없으니 DB 왕복도 늘지 않는다.
   */
  createInTx(
    tx: Prisma.TransactionClient,
    userIdx: bigint,
    type: NotificationType,
    payload: object,
  ): Promise<NotificationRow> {
    return tx.notification.create({
      data: { userIdx, type, payload },
    });
  }

  /**
   * 커밋된 뒤에 호출한다 (트랜잭션 안에서 부르면 롤백된 알림을 보낼 수 있다).
   * 같은 인스턴스에 연결돼 있으면 즉시 전달하고, 아니면 디스패처의 폴링에 맡긴다.
   */
  deliver(notification: NotificationRow | null): void {
    if (!notification) return;
    const userIdx = Number(notification.userIdx);
    // 여기서 못 보내면 폴링이 집어 가야 하므로, 실제로 보낸 것만 표시한다.
    if (!this.sseService.isConnected(userIdx)) return;
    // 폴링이 먼저 집어 갔으면 그쪽이 이미 보냈다 — 두 번 보내지 않는다.
    if (!this.dispatcher.claim(notification.id)) return;
    this.sseService.push(userIdx, [toNotificationDto(notification)]);
  }

  /**
   * SSE 스트림. lastEventId 가 있으면 그 이후 알림을 먼저 흘려보낸 뒤 실시간에 연결한다.
   * EventSource 는 재연결할 때 Last-Event-ID 헤더를 자동으로 보내므로,
   * 끊겼던 구간의 알림이 별도 처리 없이 메워진다.
   */
  stream(user: AuthUser, lastEventId?: string): Observable<MessageEvent> {
    const from = this.parseEventId(lastEventId);
    return this.sseService.connect(
      user.idx,
      from === null ? undefined : () => this.replaySince(user.idx, from),
    );
  }

  async getList(user: AuthUser): Promise<NotificationDto[]> {
    const now = new Date();
    // 이전달 1일부터 조회 — 파티션 프루닝으로 2개 파티션만 스캔
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userIdx: BigInt(user.idx),
        createdAt: { gte: start },
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map(toNotificationDto);
  }

  // createdAt 범위 필터로 MySQL 파티션 프루닝 활성화
  async getListByMonth(
    year: number,
    month: number,
    user: AuthUser,
  ): Promise<NotificationDto[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userIdx: BigInt(user.idx),
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map(toNotificationDto);
  }

  async markAsRead(
    dto: { id: number; type: string; isRead: boolean },
    user: AuthUser,
  ): Promise<{ message: string }> {
    await this.prisma.notification.updateMany({
      where: { id: BigInt(dto.id), userIdx: BigInt(user.idx), type: dto.type },
      data: { isRead: dto.isRead },
    });
    return { message: "수정되었습니다." };
  }

  async markAllAsRead(user: AuthUser): Promise<{ message: string }> {
    await this.prisma.notification.updateMany({
      where: { userIdx: BigInt(user.idx), isRead: false },
      data: { isRead: true },
    });
    return { message: "전체 읽음 처리되었습니다." };
  }

  async delete(
    dto: { id: number; type: string },
    user: AuthUser,
  ): Promise<{ message: string }> {
    await this.prisma.notification.deleteMany({
      where: { id: BigInt(dto.id), userIdx: BigInt(user.idx), type: dto.type },
    });
    return { message: "삭제되었습니다." };
  }

  async dropPartition(
    year: number,
    month: number,
  ): Promise<{ message: string }> {
    const pName = `p_${year}_${String(month).padStart(2, "0")}`;

    const rows = await this.prisma.$queryRawUnsafe<{ cnt: number }[]>(`
      SELECT COUNT(*) AS cnt
      FROM INFORMATION_SCHEMA.PARTITIONS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notifications'
        AND PARTITION_NAME = '${pName}'
    `);

    if (!rows[0] || Number(rows[0].cnt) === 0) {
      throw new AppException(
        ErrorCode.NOT_FOUND,
        `${year}년 ${month}월 파티션이 존재하지 않습니다.`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.$executeRawUnsafe(`
      ALTER TABLE notifications DROP PARTITION \`${pName}\`
    `);
    return { message: `${year}년 ${month}월 알림 파티션이 삭제되었습니다.` };
  }

  // 매월 1일 00:10 — 2달 전 파티션 DROP (이전달 + 이번달만 유지)
  @Cron("10 0 1 * *")
  async dropOldPartition(): Promise<void> {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const year = target.getFullYear();
    const month = target.getMonth() + 1;

    try {
      await this.dropPartition(year, month);
    } catch {
      // 파티션이 없으면 무시
    }
  }

  // 매월 1일 00:05 — 다음달 파티션을 ADD PARTITION으로 미리 생성
  @Cron("5 0 1 * *")
  async createNextMonthPartition(): Promise<void> {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const year = target.getFullYear();
    const month = target.getMonth() + 1; // 1~12

    // 파티션은 RANGE COLUMNS(createdAt) 이므로 경계는 정수가 아니라 날짜다.
    // 이 파티션이 담을 마지막 순간의 바로 다음, 즉 "다음 달 1일 00:00" 이 상한이다.
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const upperBound = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01 00:00:00.000`;

    const pName = `p_${year}_${String(month).padStart(2, "0")}`;

    try {
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE notifications
        ADD PARTITION (
          PARTITION \`${pName}\` VALUES LESS THAN ('${upperBound}')
        )
      `);
    } catch {
      // 이미 존재하는 파티션이면 무시
    }
  }

  /** 재연결 구간에 놓친 알림 */
  private async replaySince(
    userIdx: number,
    lastEventId: bigint,
  ): Promise<NotificationDto[]> {
    const rows = await this.prisma.notification.findMany({
      where: {
        userIdx: BigInt(userIdx),
        id: { gt: lastEventId },
        createdAt: { gte: new Date(Date.now() - REPLAY_LOOKBACK_MS) },
      },
      orderBy: { id: "asc" },
      take: REPLAY_LIMIT,
    });
    return rows.map(toNotificationDto);
  }

  private parseEventId(raw?: string): bigint | null {
    if (!raw) return null;
    try {
      const id = BigInt(raw);
      return id >= 0n ? id : null;
    } catch {
      return null;
    }
  }
}

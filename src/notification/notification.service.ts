// @role: features/notification
// @rule: DB 저장 및 SSE push만 담당
import { HttpStatus, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { SseService } from "./sse.service";
import { NotificationQueueService } from "./notification-queue.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  create(userIdx: bigint, type: string, payload: object): void {
    this.notificationQueue.enqueue(userIdx, type, payload);
  }

  async getList(user: AuthUser) {
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

    return notifications.map((n) => ({
      id: Number(n.id),
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      payload: n.payload,
    }));
  }

  // createdAt 범위 필터로 MySQL 파티션 프루닝 활성화
  async getListByMonth(year: number, month: number, user: AuthUser) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userIdx: BigInt(user.idx),
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map((n) => ({
      id: Number(n.id),
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      payload: n.payload,
    }));
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
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    await this.prisma.notification.updateMany({
      where: { userIdx: BigInt(user.idx), isRead: false, createdAt: { gte: start } },
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

  async dropPartition(year: number, month: number): Promise<{ message: string }> {
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

  // 매월 1일 00:05 — 현재달 파티션이 없으면 새 1년치 생성 + 이전 1년치 삭제
  @Cron("5 0 1 * *")
  async rotateYearlyPartitions(): Promise<boolean> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1~12
    const currentPName = `p_${year}_${String(month).padStart(2, "0")}`;

    const rows = await this.prisma.$queryRawUnsafe<{ cnt: number }[]>(`
      SELECT COUNT(*) AS cnt
      FROM INFORMATION_SCHEMA.PARTITIONS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notifications'
        AND PARTITION_NAME = '${currentPName}'
    `);

    // 현재달 파티션이 이미 있으면 일반 달 → 로테이션 불필요
    if (!rows[0] || Number(rows[0].cnt) > 0) return false;

    // 새 12개월 파티션 생성 (현재달 ~ 현재달+11)
    for (let i = 0; i < 12; i++) {
      const target = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = target.getFullYear();
      const m = target.getMonth() + 1;
      const nextM = m === 12 ? 1 : m + 1;
      const nextY = m === 12 ? y + 1 : y;
      const pName = `p_${y}_${String(m).padStart(2, "0")}`;
      // 파티션이 RANGE COLUMNS(createdAt) 이므로 경계는 정수(YYYYMM)가 아니라 날짜다.
      const upperBound = `${nextY}-${String(nextM).padStart(2, "0")}-01 00:00:00.000`;

      try {
        await this.prisma.$executeRawUnsafe(`
          ALTER TABLE notifications ADD PARTITION (
            PARTITION \`${pName}\` VALUES LESS THAN ('${upperBound}')
          )
        `);
      } catch {}
    }

    // 이전 12개월 파티션 삭제 (현재달-12 ~ 현재달-1)
    for (let i = 12; i >= 1; i--) {
      const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = target.getFullYear();
      const m = target.getMonth() + 1;

      try {
        await this.dropPartition(y, m);
      } catch {}
    }

    return true;
  }
}

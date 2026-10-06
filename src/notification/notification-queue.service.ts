// @role: features/notification
// @rule: 알림 인메모리 큐 — 순서 보장 + 지수 백오프 재시도
import { Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "./sse.service";

interface NotificationJob {
  userIdx: bigint;
  type: string;
  payload: object;
}

const MAX_RETRY = 3;
const BASE_DELAY_MS = 500;

@Injectable()
export class NotificationQueueService {
  private readonly queue: NotificationJob[] = [];
  private processing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
  ) {}

  // 동기 — await 없이 즉시 적재해서 도착 순서 보장
  enqueue(userIdx: bigint, type: string, payload: object): void {
    this.queue.push({ userIdx, type, payload });
    void this.startWorker();
  }

  private async startWorker(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift()!;
        await this.processWithRetry(job);
      }
    } finally {
      this.processing = false;
      if (this.queue.length > 0) void this.startWorker();
    }
  }

  private async processWithRetry(job: NotificationJob): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        await this.process(job);
        return;
      } catch {
        if (attempt < MAX_RETRY) {
          // 지수 백오프: 500ms → 1000ms → 2000ms
          await new Promise((resolve) =>
            setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt - 1)),
          );
        }
      }
    }
  }

  private async process(job: NotificationJob): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        userIdx: job.userIdx,
        type: job.type,
        payload: job.payload as Prisma.InputJsonValue,
      },
    });

    // SSE push 실패는 무시 (DB에 저장됐으니 알림창 열면 보임)
    try {
      this.sseService.push(Number(job.userIdx), {
        id: Number(notification.id),
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        payload: job.payload,
      });
    } catch {}
  }
}

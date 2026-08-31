// @role: features/notification
// @rule: DB 커서 폴링으로 새 알림을 찾아 SSE 로 전달하는 것만 담당
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SseService } from "./sse.service";
import { toNotificationDto, type NotificationDto } from "./notification.types";

const POLL_INTERVAL_MS = 500;
/** 한 틱에 가져올 최대 건수 */
const POLL_LIMIT = 500;
/** 조회 하한 — createdAt 범위를 걸어야 파티션 프루닝이 살아 있다 */
const LOOKBACK_MS = 5 * 60_000;
/** 중복 방지용 id 를 들고 있는 시간 */
const PUSHED_TTL_MS = 60_000;

/**
 * 알림 "전달" 전담 워커.
 *
 * 생성자(좋아요/댓글)는 도메인 트랜잭션에서 notifications 에 INSERT 만 하고 빠진다.
 * 이 디스패처가 인스턴스당 1개의 타이머로 새 row 를 한 번에 긁어 와,
 * 자기 인스턴스에 붙어 있는 유저에게만 SSE 로 뿌린다.
 * 알림이 1건이든 500건이든 조회는 틱당 1회다.
 */
@Injectable()
export class NotificationDispatcher
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationDispatcher.name);

  /** 여기까지는 배달 확정. 다음 조회는 이 id 초과부터 한다. */
  private cursor = 0n;
  /**
   * 직전 틱에서 본 최대 id.
   *
   * 커서를 한 틱 늦게 전진시키기 위한 값이다. auto_increment id 는 INSERT 시점에
   * 배정되지만 커밋은 그보다 늦을 수 있어, 낮은 id 가 높은 id 보다 나중에 보이는
   * 역전이 일어난다. 커서를 곧바로 최댓값으로 올리면 그 낮은 id 는 영영 조회
   * 범위 밖으로 밀려난다. 한 틱 늦게 올려 같은 구간을 두 번 훑어 그걸 잡아낸다.
   */
  private prevMax = 0n;
  /** 이미 보낸 id — fast path 와 겹치는 구간 재조회로 인한 중복 발송을 막는다 */
  private readonly pushed = new Map<string, number>();

  private timer?: NodeJS.Timeout;
  private ticking = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sse: SseService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // 기동 시점의 최신 id 에서 출발한다. 과거 알림을 한꺼번에 다시 쏘지 않기 위함이며,
    // 재시작 중 놓친 알림은 클라이언트가 Last-Event-ID 로 재요청한다.
    this.cursor = await this.findMaxId();
    this.prevMax = this.cursor;
    this.timer = setInterval(() => void this.tick(), POLL_INTERVAL_MS);
    this.logger.log(
      `알림 디스패처 시작 (cursor=${this.cursor}, 주기=${POLL_INTERVAL_MS}ms)`,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * 이 알림의 발송권을 잡는다. 아직 아무도 안 보냈으면 true.
   *
   * 커밋 직후의 fast path 와 폴링은 같은 알림을 동시에 집을 수 있다 —
   * 커밋과 deliver() 사이에 폴링 틱이 끼어들면 양쪽이 다 보내 중복이 된다.
   * 단일 스레드라 이 검사-후-기록은 쪼개지지 않으므로, 먼저 잡은 쪽만 보낸다.
   */
  claim(id: bigint): boolean {
    const key = String(id);
    if (this.pushed.has(key)) return false;
    this.pushed.set(key, Date.now());
    return true;
  }

  private async tick(): Promise<void> {
    // 조회가 폴링 주기보다 오래 걸리면 틱이 겹치지 않도록 건너뛴다.
    if (this.ticking) return;
    this.ticking = true;
    try {
      this.sweepPushed();
      // 붙어 있는 연결이 없으면 조회할 이유가 없다.
      // 커서를 멈춰 둬도 LOOKBACK_MS 가 재개 시 조회 범위를 묶어 준다.
      if (!this.sse.hasAnyClient()) return;

      const rows = await this.prisma.notification.findMany({
        where: {
          id: { gt: this.cursor },
          createdAt: { gte: new Date(Date.now() - LOOKBACK_MS) },
        },
        orderBy: { id: "asc" },
        take: POLL_LIMIT,
      });

      let maxId = this.prevMax;
      const byUser = new Map<number, NotificationDto[]>();

      for (const row of rows) {
        if (row.id > maxId) maxId = row.id;

        // 이 인스턴스에 붙어 있지 않은 유저는 건너뛴다.
        // 다른 인스턴스가 자기 커서로 같은 row 를 보고 배달하고,
        // 아무 데도 안 붙어 있으면 접속할 때 목록 조회로 받아 간다.
        // 발송권은 실제로 보낼 때만 잡는다 — 여기서 미리 잡아 버리면
        // 직후에 접속한 유저의 fast path 가 막혀 알림이 사라진다.
        const userIdx = Number(row.userIdx);
        if (!this.sse.isConnected(userIdx)) continue;
        if (!this.claim(row.id)) continue;

        const bucket = byUser.get(userIdx);
        if (bucket) bucket.push(toNotificationDto(row));
        else byUser.set(userIdx, [toNotificationDto(row)]);
      }

      for (const [userIdx, items] of byUser) this.sse.push(userIdx, items);

      // 커서는 항상 "직전 틱의 최댓값"까지만 올린다.
      this.cursor = this.prevMax;
      this.prevMax = maxId;

      if (rows.length === POLL_LIMIT) {
        this.logger.warn(
          `알림 폴링이 한 틱 상한(${POLL_LIMIT})에 닿았습니다. 나머지는 다음 틱에 처리합니다.`,
        );
      }
    } catch (error: unknown) {
      // 커서를 그대로 두므로 다음 틱에서 같은 구간을 다시 시도한다.
      this.logger.error(`알림 폴링 실패: ${String(error)}`);
    } finally {
      this.ticking = false;
    }
  }

  private async findMaxId(): Promise<bigint> {
    const latest = await this.prisma.notification.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });
    return latest?.id ?? 0n;
  }

  private sweepPushed(): void {
    const deadline = Date.now() - PUSHED_TTL_MS;
    for (const [id, at] of this.pushed) {
      if (at < deadline) this.pushed.delete(id);
    }
  }
}

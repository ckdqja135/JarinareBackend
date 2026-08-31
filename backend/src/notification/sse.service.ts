// @role: features/sse
// @rule: 유저별 SSE 연결 관리만 담당 (탭 다중 연결 + heartbeat)
import { Injectable, Logger, MessageEvent } from "@nestjs/common";
import { interval, map, merge, Observable, ReplaySubject } from "rxjs";
import { finalize } from "rxjs/operators";
import type { NotificationDto } from "./notification.types";

/** 프록시(nginx 등)의 유휴 커넥션 타임아웃을 피하기 위한 keep-alive 주기 */
const HEARTBEAT_MS = 30_000;
/** connect() 호출과 실제 구독 사이의 공백을 메우기 위한 버퍼 */
const BUFFER_SIZE = 100;
const BUFFER_WINDOW_MS = 60_000;
/**
 * 리플레이가 끝난 뒤에도 중복 방지 집합을 유지하는 시간.
 *
 * 끊겨 있는 동안 디스패처는 커서를 멈춰 두므로, 재연결 직후 첫 폴링이
 * 리플레이로 이미 보낸 알림을 "처음 본 것"으로 들고 온다. 폴링 한 바퀴를
 * 넉넉히 덮을 만큼만 집합을 남겨 두면 그 중복이 걸러진다.
 */
const REPLAY_DEDUPE_MS = 10_000;

interface SseClient {
  readonly subject: ReplaySubject<MessageEvent>;
  /**
   * 재연결 직후 잠깐만 유지되는 중복 방지 집합.
   *
   * 리플레이와 디스패처 폴링은 서로를 모르므로 같은 알림을 양쪽에서 보낼 수
   * 있다. 순서는 둘 다 가능하다 — 조회 중에 폴링이 먼저 밀어 넣기도 하고,
   * 리플레이가 끝난 직후 폴링이 뒤늦게 같은 걸 들고 오기도 한다.
   * 그 구간 동안만 id 로 걸러 주고, 지나면 버려서 메모리를 남기지 않는다.
   */
  emitted: Set<string> | null;
  /** emitted 를 비우는 타이머 — 연결이 먼저 끊기면 취소한다. */
  dedupeTimer?: NodeJS.Timeout;
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  // 한 유저가 탭을 여러 개 열 수 있으므로 연결을 Set 으로 관리한다.
  private readonly clients = new Map<number, Set<SseClient>>();

  /**
   * SSE 연결을 등록하고 스트림을 돌려준다.
   * replay 를 넘기면 등록 직후 밀린 알림을 "이 연결에만" 흘려보낸다.
   * 등록이 먼저이므로 리플레이 조회 중 도착한 알림도 유실되지 않는다.
   */
  connect(
    userIdx: number,
    replay?: () => Promise<NotificationDto[]>,
  ): Observable<MessageEvent> {
    const client: SseClient = {
      subject: new ReplaySubject<MessageEvent>(BUFFER_SIZE, BUFFER_WINDOW_MS),
      emitted: replay ? new Set<string>() : null,
    };

    const sockets = this.clients.get(userIdx) ?? new Set<SseClient>();
    sockets.add(client);
    this.clients.set(userIdx, sockets);

    if (replay) {
      void replay()
        .then((missed) => this.emit(client, missed))
        .catch((error: unknown) => {
          this.logger.warn(
            `알림 리플레이 실패 (userIdx=${userIdx}): ${String(error)}`,
          );
        })
        .finally(() => {
          // 리플레이가 끝나자마자 비우면, 곧이어 도착하는 폴링분을 못 거른다.
          client.dedupeTimer = setTimeout(() => {
            client.emitted = null;
          }, REPLAY_DEDUPE_MS);
          client.dedupeTimer.unref?.();
        });
    }

    const heartbeat$ = interval(HEARTBEAT_MS).pipe(
      // type 을 지정해야 클라이언트의 onmessage 에 잡히지 않는다.
      map((): MessageEvent => ({ type: "ping", data: "" })),
    );

    return merge(client.subject.asObservable(), heartbeat$).pipe(
      finalize(() => {
        if (client.dedupeTimer) clearTimeout(client.dedupeTimer);
        sockets.delete(client);
        if (sockets.size === 0) this.clients.delete(userIdx);
      }),
    );
  }

  /** 붙어 있는 연결이 하나라도 있는지 — 디스패처가 헛돌지 않게 한다. */
  hasAnyClient(): boolean {
    return this.clients.size > 0;
  }

  isConnected(userIdx: number): boolean {
    return this.clients.has(userIdx);
  }

  /** 여러 건을 한 이벤트로 묶어 보낸다 — 프론트 리렌더가 1회로 끝난다. */
  push(userIdx: number, notifications: NotificationDto[]): void {
    if (notifications.length === 0) return;
    const sockets = this.clients.get(userIdx);
    if (!sockets) return;
    for (const client of sockets) this.emit(client, notifications);
  }

  private emit(client: SseClient, notifications: NotificationDto[]): void {
    const emitted = client.emitted;
    const fresh = emitted
      ? notifications.filter((n) => !emitted.has(String(n.id)))
      : notifications;
    if (fresh.length === 0) return;
    if (emitted) {
      for (const n of fresh) emitted.add(String(n.id));
    }

    // id 를 실어야 EventSource 가 재연결할 때 Last-Event-ID 헤더로 되돌려준다.
    client.subject.next({
      id: String(fresh[fresh.length - 1].id),
      data: JSON.stringify(fresh),
    });
  }
}

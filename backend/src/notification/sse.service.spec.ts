import type { MessageEvent } from "@nestjs/common";
import type { Subscription } from "rxjs";
import { SseService } from "./sse.service";
import type { NotificationDto } from "./notification.types";

/** 마이크로태스크가 모두 처리된 뒤 단언하기 위한 플러시. */
const flush = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

const dto = (id: number): NotificationDto => ({
  id,
  type: "comment",
  isRead: false,
  createdAt: new Date("2026-08-29T00:00:00.000Z").toISOString(),
  payload: { boardId: 1 },
});

/** 이벤트에 실려 온 알림 id 목록 */
const idsOf = (e: MessageEvent): number[] =>
  (JSON.parse(e.data as string) as NotificationDto[]).map((n) => n.id);

describe("SseService", () => {
  let service: SseService;
  const subs: Subscription[] = [];

  const listen = (
    userIdx: number,
    replay?: () => Promise<NotificationDto[]>,
  ) => {
    const events: MessageEvent[] = [];
    const sub = service.connect(userIdx, replay).subscribe((e) => {
      events.push(e);
    });
    subs.push(sub);
    return { events, sub };
  };

  beforeEach(() => {
    service = new SseService();
  });

  afterEach(() => {
    while (subs.length) subs.pop()!.unsubscribe();
  });

  it("한 유저가 탭을 여러 개 열어도 모든 연결이 알림을 받는다", () => {
    const tabA = listen(1);
    const tabB = listen(1);

    service.push(1, [dto(10)]);

    expect(idsOf(tabA.events[0])).toEqual([10]);
    expect(idsOf(tabB.events[0])).toEqual([10]);
  });

  it("여러 건을 한 이벤트로 묶고, 이벤트 id 에 마지막 알림 id 를 싣는다", () => {
    const tab = listen(1);

    service.push(1, [dto(10), dto(11), dto(12)]);

    expect(tab.events).toHaveLength(1);
    expect(idsOf(tab.events[0])).toEqual([10, 11, 12]);
    // EventSource 가 재연결 때 Last-Event-ID 로 되돌려줄 값
    expect(tab.events[0].id).toBe("12");
  });

  it("다른 유저에게는 새지 않는다", () => {
    const mine = listen(1);
    const other = listen(2);

    service.push(1, [dto(10)]);

    expect(mine.events).toHaveLength(1);
    expect(other.events).toHaveLength(0);
  });

  it("탭을 하나 닫아도 남은 탭은 계속 받는다", () => {
    const tabA = listen(1);
    const tabB = listen(1);

    tabA.sub.unsubscribe();
    expect(service.isConnected(1)).toBe(true);

    service.push(1, [dto(10)]);
    expect(tabA.events).toHaveLength(0);
    expect(idsOf(tabB.events[0])).toEqual([10]);
  });

  it("마지막 연결이 끊기면 유저를 정리한다", () => {
    const tab = listen(1);
    expect(service.hasAnyClient()).toBe(true);

    tab.sub.unsubscribe();

    expect(service.isConnected(1)).toBe(false);
    expect(service.hasAnyClient()).toBe(false);
    // 끊긴 뒤 push 는 조용히 무시된다
    expect(() => service.push(1, [dto(10)])).not.toThrow();
  });

  it("리플레이 조회 중 도착한 알림도 받고, 리플레이와 겹치면 한 번만 보낸다", async () => {
    // 재연결 → 끊긴 사이의 10, 11 을 리플레이로 받아야 한다
    const tab = listen(1, () => Promise.resolve([dto(10), dto(11)]));

    // 리플레이 조회가 끝나기 전에 디스패처가 11, 12 를 밀어 넣는다
    service.push(1, [dto(11), dto(12)]);
    await flush();

    const delivered = tab.events.flatMap(idsOf);
    expect(delivered).toEqual([11, 12, 10]); // 11 이 두 번 나오지 않는다
    expect([...delivered].sort((a, b) => a - b)).toEqual([10, 11, 12]);
  });

  it("리플레이 직후 폴링이 같은 알림을 들고 와도 두 번 보내지 않는다", async () => {
    // 끊겨 있는 동안 디스패처는 커서를 멈춰 두므로, 재연결 후 첫 폴링이
    // 리플레이로 이미 보낸 알림을 "처음 본 것"으로 들고 온다.
    const tab = listen(1, () => Promise.resolve([dto(10), dto(11)]));
    await flush(); // 리플레이 완료

    service.push(1, [dto(10), dto(11)]); // 뒤늦게 도착한 폴링분

    expect(tab.events.flatMap(idsOf)).toEqual([10, 11]);
  });

  it("중복 방지 창이 지나면 집합을 버려 메모리를 남기지 않는다", async () => {
    jest.useFakeTimers();
    try {
      const tab = listen(1, () => Promise.resolve([dto(10)]));
      await jest.advanceTimersByTimeAsync(0); // 리플레이 then/finally 소화
      await jest.advanceTimersByTimeAsync(10_000); // 중복 방지 창 종료

      service.push(1, [dto(10)]);
      expect(tab.events.flatMap(idsOf)).toEqual([10, 10]);
    } finally {
      jest.useRealTimers();
    }
  });

  it("리플레이 조회가 실패해도 스트림은 살아 있다", async () => {
    const tab = listen(1, () => Promise.reject(new Error("DB down")));
    await flush();

    service.push(1, [dto(10)]);

    expect(idsOf(tab.events[0])).toEqual([10]);
  });

  it("빈 배열은 이벤트를 만들지 않는다", () => {
    const tab = listen(1);
    service.push(1, []);
    expect(tab.events).toHaveLength(0);
  });

  it("30초마다 ping 이 흐르고 onmessage 에는 잡히지 않는다", () => {
    jest.useFakeTimers();
    try {
      const tab = listen(1);

      jest.advanceTimersByTime(30_000);

      expect(tab.events).toHaveLength(1);
      // type 이 있으므로 클라이언트의 onmessage 가 아니라 'ping' 리스너로 간다
      expect(tab.events[0].type).toBe("ping");
    } finally {
      jest.useRealTimers();
    }
  });
});

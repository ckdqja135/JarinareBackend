import type { PrismaService } from "../prisma/prisma.service";
import { NotificationDispatcher } from "./notification-dispatcher.service";
import type { SseService } from "./sse.service";

interface Row {
  id: bigint;
  userIdx: bigint;
  type: string;
  isRead: boolean;
  payload: unknown;
  createdAt: Date;
}

const row = (id: number, userIdx: number): Row => ({
  id: BigInt(id),
  userIdx: BigInt(userIdx),
  type: "board_like",
  isRead: false,
  payload: { boardId: 1 },
  createdAt: new Date(),
});

interface FindManyArgs {
  where: { id: { gt: bigint }; createdAt: { gte: Date } };
  take: number;
}

/**
 * "커밋된 것만 보이는" DB 를 흉내낸다.
 * 테스트에서 committed 배열에 row 를 밀어 넣는 순간이 곧 커밋 시점이다.
 */
function createPrismaMock(committed: Row[]) {
  return {
    notification: {
      findMany: jest.fn(({ where, take }: FindManyArgs) =>
        Promise.resolve(
          committed
            .filter(
              (r) => r.id > where.id.gt && r.createdAt >= where.createdAt.gte,
            )
            .sort((a, b) => Number(a.id - b.id))
            .slice(0, take),
        ),
      ),
      findFirst: jest.fn(() =>
        Promise.resolve(
          committed.length === 0
            ? null
            : [...committed].sort((a, b) => Number(b.id - a.id))[0],
        ),
      ),
    },
  };
}

function createSseMock(connected: number[]) {
  const pushes: { userIdx: number; ids: number[] }[] = [];
  return {
    pushes,
    hasAnyClient: jest.fn(() => connected.length > 0),
    isConnected: jest.fn((userIdx: number) => connected.includes(userIdx)),
    push: jest.fn((userIdx: number, items: { id: number }[]) => {
      pushes.push({ userIdx, ids: items.map((i) => i.id) });
    }),
  };
}

type PrismaMock = ReturnType<typeof createPrismaMock>;
type SseMock = ReturnType<typeof createSseMock>;

/** 실제 주입 대신 목을 꽂는다. */
const build = (prisma: PrismaMock, sse: SseMock): NotificationDispatcher =>
  new NotificationDispatcher(
    prisma as unknown as PrismaService,
    sse as unknown as SseService,
  );

/** 타이머 없이 틱을 직접 돌린다. */
const tick = (d: NotificationDispatcher): Promise<void> =>
  (d as unknown as { tick(): Promise<void> }).tick();

async function boot(
  prisma: PrismaMock,
  sse: SseMock,
): Promise<NotificationDispatcher> {
  const dispatcher = build(prisma, sse);
  await dispatcher.onApplicationBootstrap();
  dispatcher.onModuleDestroy(); // setInterval 을 끄고 수동으로 틱을 돌린다
  return dispatcher;
}

describe("NotificationDispatcher", () => {
  it("커밋이 늦어 id 순서가 역전돼도 낮은 id 를 놓치지 않는다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([7]);
    const dispatcher = await boot(prisma, sse);

    // 100번이 먼저 INSERT 됐지만 아직 커밋 전 → 101번만 보인다
    committed.push(row(101, 7));
    await tick(dispatcher);
    expect(sse.pushes).toEqual([{ userIdx: 7, ids: [101] }]);

    // 뒤늦게 100번 커밋. 커서를 101 로 올려버렸다면 여기서 영영 유실된다.
    committed.push(row(100, 7));
    await tick(dispatcher);
    expect(sse.pushes).toEqual([
      { userIdx: 7, ids: [101] },
      { userIdx: 7, ids: [100] },
    ]);

    // 다 배달했으니 더는 아무것도 안 나가야 한다
    await tick(dispatcher);
    await tick(dispatcher);
    expect(sse.pushes).toHaveLength(2);
  });

  it("커서가 결국 전진해 같은 알림을 무한히 재조회하지 않는다", async () => {
    const committed: Row[] = [row(10, 1), row(11, 1)];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([1]);
    const dispatcher = build(prisma, sse);
    // 기동 시점에 이미 있던 알림은 다시 쏘지 않는다
    await dispatcher.onApplicationBootstrap();
    dispatcher.onModuleDestroy();
    await tick(dispatcher);
    expect(sse.pushes).toEqual([]);

    committed.push(row(12, 1));
    await tick(dispatcher);
    await tick(dispatcher);
    await tick(dispatcher);
    expect(sse.pushes).toEqual([{ userIdx: 1, ids: [12] }]);
    // 커서가 12 를 넘어서 더는 12 를 후보로 담지 않는다
    const lastCall = prisma.notification.findMany.mock.calls.at(-1)![0];
    expect(lastCall.where.id.gt).toBe(12n);
  });

  it("fast path 로 이미 보낸 알림은 폴링이 다시 보내지 않는다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([3]);
    const dispatcher = await boot(prisma, sse);

    // 커밋 직후 즉시 전송된 상황
    expect(dispatcher.claim(50n)).toBe(true);
    committed.push(row(50, 3));

    await tick(dispatcher);
    await tick(dispatcher);
    expect(sse.push).not.toHaveBeenCalled();
  });

  it("폴링이 먼저 보냈으면 fast path 는 발송권을 못 잡는다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([3]);
    const dispatcher = await boot(prisma, sse);

    // 커밋 직후 deliver() 가 불리기 전에 폴링 틱이 먼저 그 row 를 집어 간다
    committed.push(row(60, 3));
    await tick(dispatcher);
    expect(sse.pushes).toEqual([{ userIdx: 3, ids: [60] }]);

    // 뒤늦게 도착한 fast path 는 이미 보낸 걸 알고 물러난다
    expect(dispatcher.claim(60n)).toBe(false);
  });

  it("연결 안 된 유저의 알림은 발송권을 미리 잡지 않는다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([]); // 아무도 안 붙어 있음
    const dispatcher = new NotificationDispatcher(
      prisma as unknown as PrismaService,
      { ...sse, hasAnyClient: () => true } as unknown as SseService,
    );
    await dispatcher.onApplicationBootstrap();
    dispatcher.onModuleDestroy();

    committed.push(row(70, 3));
    await tick(dispatcher);

    // 폴링이 훑고 지나갔어도, 직후 접속한 유저의 fast path 는 막히면 안 된다
    expect(dispatcher.claim(70n)).toBe(true);
  });

  it("이 인스턴스에 붙어 있지 않은 유저는 건너뛴다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([1]); // 2번 유저는 다른 인스턴스에 붙어 있다
    const dispatcher = await boot(prisma, sse);

    committed.push(row(1, 1), row(2, 2), row(3, 1));
    await tick(dispatcher);
    await tick(dispatcher);

    expect(sse.pushes).toEqual([{ userIdx: 1, ids: [1, 3] }]);
  });

  it("한 유저의 여러 알림을 한 번의 push 로 묶는다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([9]);
    const dispatcher = await boot(prisma, sse);

    committed.push(row(1, 9), row(2, 9), row(3, 9));
    await tick(dispatcher);

    expect(sse.push).toHaveBeenCalledTimes(1);
    expect(sse.pushes).toEqual([{ userIdx: 9, ids: [1, 2, 3] }]);
  });

  it("붙어 있는 연결이 없으면 조회 자체를 하지 않는다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([]); // 아무도 안 붙어 있음
    const dispatcher = await boot(prisma, sse);

    committed.push(row(1, 1));
    await tick(dispatcher);

    expect(prisma.notification.findMany).not.toHaveBeenCalled();
  });

  it("조회가 실패해도 커서를 유지해 다음 틱에 다시 배달한다", async () => {
    const committed: Row[] = [];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([4]);
    const dispatcher = await boot(prisma, sse);

    committed.push(row(1, 4));
    prisma.notification.findMany.mockRejectedValueOnce(new Error("DB down"));
    await tick(dispatcher); // 실패 — 커서 그대로
    expect(sse.push).not.toHaveBeenCalled();

    await tick(dispatcher);
    await tick(dispatcher);
    expect(sse.pushes).toEqual([{ userIdx: 4, ids: [1] }]);
  });

  it("틱이 겹치면 나중 틱을 건너뛴다", async () => {
    const committed: Row[] = [row(1, 5)];
    const prisma = createPrismaMock(committed);
    const sse = createSseMock([5]);
    const dispatcher = await boot(prisma, sse);

    let release!: () => void;
    prisma.notification.findMany.mockReturnValueOnce(
      new Promise((resolve) => {
        release = () => resolve([]);
      }),
    );

    const first = tick(dispatcher); // 아직 안 끝난 틱
    await tick(dispatcher); // 겹친 틱 — 조회 없이 즉시 반환
    expect(prisma.notification.findMany).toHaveBeenCalledTimes(1);

    release();
    await first;
  });
});

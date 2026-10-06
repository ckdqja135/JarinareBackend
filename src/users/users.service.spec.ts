import { UsersService } from "./users.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { ErrorCode } from "../common/errors/error-code";

const authUser: AuthUser = { idx: 1, email: "test@test.com", role: "user" };

interface UserRow {
  idx: bigint;
  userId: string;
  name: string;
  email: string | null;
  password: string | null;
  age: string;
  gender: string;
  seatChageCount: number;
  point: number;
  notifiChange: boolean;
  notifResponse: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

function fakeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    idx: BigInt(1),
    userId: "test@test.com",
    name: "홍길동",
    email: "test@test.com",
    password: null,
    age: "",
    gender: "",
    seatChageCount: 0,
    point: 0,
    notifiChange: true,
    notifResponse: true,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function updateData(update: jest.Mock): Record<string, unknown> {
  const arg = update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
  return arg.data;
}

describe("UsersService", () => {
  let prisma: {
    user: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
      update: jest.Mock;
    };
  };
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new UsersService(prisma as never);
  });

  it("getMe: 최초 로그인 시 기본값으로 사용자를 생성(upsert)한다", async () => {
    prisma.user.upsert.mockResolvedValue(fakeUser());
    const profile = await service.getMe(authUser);
    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@test.com" },
        create: expect.objectContaining({
          seatChageCount: 0,
          point: 0,
          notifiChange: true,
          notifResponse: true,
        }),
      }),
    );
    expect(profile.idx).toBe(1);
    expect(profile.point).toBe(0);
  });

  it("getPublicProfile: 없는 사용자면 USER_NOT_FOUND", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.getPublicProfile("none")).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
  });

  it("getPublicProfile: 공개 필드(userId/name)만 반환한다", async () => {
    prisma.user.findFirst.mockResolvedValue(fakeUser({ point: 9999 }));
    const result = await service.getPublicProfile("test@test.com");
    expect(result).toEqual({ name: "홍길동", userId: "test@test.com" });
    expect(result).not.toHaveProperty("point");
  });

  it("updateProfile: point/seatChageCount 는 수정 데이터에 포함되지 않는다", async () => {
    prisma.user.upsert.mockResolvedValue(fakeUser());
    prisma.user.update.mockResolvedValue(fakeUser({ name: "새이름" }));
    await service.updateProfile(authUser, { name: "새이름" });
    const data = updateData(prisma.user.update);
    expect(data).toEqual({ name: "새이름" });
    expect(data).not.toHaveProperty("point");
    expect(data).not.toHaveProperty("seatChageCount");
  });

  it("updateNotificationSettings: notifiChange/notifResponse 를 반영한다", async () => {
    prisma.user.upsert.mockResolvedValue(fakeUser());
    prisma.user.update.mockResolvedValue(fakeUser({ notifiChange: false }));
    await service.updateNotificationSettings(authUser, { notifiChange: false });
    expect(updateData(prisma.user.update)).toEqual({ notifiChange: false });
  });

  it("addPoint: 포인트를 원자적으로 증가시킨다", async () => {
    prisma.user.update.mockResolvedValue(fakeUser({ point: 2000 }));
    await service.addPoint("test@test.com", 2000);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
      data: { point: { increment: 2000 } },
    });
  });

  it("incrementChangeCount: 좌석 변경 횟수를 원자적으로 증가시킨다", async () => {
    prisma.user.update.mockResolvedValue(fakeUser({ seatChageCount: 1 }));
    await service.incrementChangeCount("test@test.com");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
      data: { seatChageCount: { increment: 1 } },
    });
  });
});

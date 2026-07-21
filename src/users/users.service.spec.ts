import { UsersService } from './users.service';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ErrorCode } from '../common/errors/error-code';

const authUser: AuthUser = { uid: 'uid-1', name: '홍길동', role: 'user' };

interface UserRow {
  uid: string;
  userId: string;
  name: string;
  email: string | null;
  age: string;
  gender: string;
  changeCount: number;
  point: number;
  change: boolean;
  response: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

function fakeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    uid: 'uid-1',
    userId: 'uid-1',
    name: '홍길동',
    email: null,
    age: '',
    gender: '',
    changeCount: 0,
    point: 0,
    change: true,
    response: true,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/** update({ data }) 로 전달된 data 를 타입 안전하게 꺼낸다. */
function updateData(update: jest.Mock): Record<string, unknown> {
  const arg = update.mock.calls[0]?.[0] as { data: Record<string, unknown> };
  return arg.data;
}

describe('UsersService', () => {
  let prisma: {
    user: { findUnique: jest.Mock; upsert: jest.Mock; update: jest.Mock };
  };
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new UsersService(prisma as never);
  });

  it('getMe: 최초 로그인 시 기본값으로 사용자를 생성(upsert)한다', async () => {
    prisma.user.upsert.mockResolvedValue(fakeUser());
    const profile = await service.getMe(authUser);
    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { uid: 'uid-1' },
        create: expect.objectContaining({
          uid: 'uid-1',
          changeCount: 0,
          point: 0,
          change: true,
          response: true,
        }),
      }),
    );
    expect(profile.uid).toBe('uid-1');
    expect(profile.point).toBe(0);
  });

  it('getPublicProfile: 없는 사용자면 USER_NOT_FOUND', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getPublicProfile('none')).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
  });

  it('getPublicProfile: 공개 필드(uid/name/userId)만 반환한다', async () => {
    prisma.user.findUnique.mockResolvedValue(fakeUser({ point: 9999 }));
    const result = await service.getPublicProfile('uid-1');
    expect(result).toEqual({ uid: 'uid-1', name: '홍길동', userId: 'uid-1' });
    expect(result).not.toHaveProperty('point');
  });

  it('updateProfile: point/changeCount 는 수정 데이터에 포함되지 않는다', async () => {
    prisma.user.upsert.mockResolvedValue(fakeUser());
    prisma.user.update.mockResolvedValue(fakeUser({ name: '새이름' }));
    await service.updateProfile(authUser, { name: '새이름' });
    const data = updateData(prisma.user.update);
    expect(data).toEqual({ name: '새이름' });
    expect(data).not.toHaveProperty('point');
    expect(data).not.toHaveProperty('changeCount');
  });

  it('updateNotificationSettings: change/response 를 반영한다', async () => {
    prisma.user.upsert.mockResolvedValue(fakeUser());
    prisma.user.update.mockResolvedValue(fakeUser({ change: false }));
    await service.updateNotificationSettings(authUser, { change: false });
    expect(updateData(prisma.user.update)).toEqual({ change: false });
  });

  it('addPoint: 포인트를 원자적으로 증가시킨다', async () => {
    prisma.user.update.mockResolvedValue(fakeUser({ point: 2000 }));
    await service.addPoint('uid-1', 2000);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { uid: 'uid-1' },
      data: { point: { increment: 2000 } },
    });
  });

  it('incrementChangeCount: 좌석 변경 횟수를 원자적으로 증가시킨다', async () => {
    prisma.user.update.mockResolvedValue(fakeUser({ changeCount: 1 }));
    await service.incrementChangeCount('uid-1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { uid: 'uid-1' },
      data: { changeCount: { increment: 1 } },
    });
  });
});

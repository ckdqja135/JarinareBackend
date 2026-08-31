import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { Prisma, User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PublicUserDto, UserProfileDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 본인 프로필 조회. 최초 로그인 등으로 아직 레코드가 없으면 기본값으로 생성한다.
   * (changeCount:0, point:0, change:true, response:true)
   */
  async getMe(authUser: AuthUser): Promise<UserProfileDto> {
    const user = await this.ensureUser(authUser);
    return this.toProfile(user);
  }

  /** 다른 사용자 조회: 공개 가능한 필드만 반환. 없으면 404. */
  async getPublicProfile(uid: string): Promise<PublicUserDto> {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    return { uid: user.uid, name: user.name, userId: user.userId };
  }

  /**
   * 일반 프로필 수정. point / changeCount / uid / role 은 변경할 수 없다.
   * (DTO whitelist 로 차단되며, 서비스에서도 허용 필드만 반영한다.)
   */
  async updateProfile(
    authUser: AuthUser,
    dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    await this.ensureUser(authUser);
    const user = await this.prisma.user.update({
      where: { uid: authUser.uid },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.userId !== undefined ? { userId: dto.userId } : {}),
        ...(dto.age !== undefined ? { age: dto.age } : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
      },
    });
    return this.toProfile(user);
  }

  /** 알림 설정(change/response) 수정. */
  async updateNotificationSettings(
    authUser: AuthUser,
    dto: UpdateNotificationSettingsDto,
  ): Promise<UserProfileDto> {
    await this.ensureUser(authUser);
    const user = await this.prisma.user.update({
      where: { uid: authUser.uid },
      data: {
        ...(dto.change !== undefined ? { change: dto.change } : {}),
        ...(dto.response !== undefined ? { response: dto.response } : {}),
      },
    });
    return this.toProfile(user);
  }

  /**
   * 최초 로그인/회원 등록 시 기본값으로 사용자 레코드를 보장한다.
   * 이미 있으면 그대로 반환(멱등).
   */
  async ensureUser(authUser: AuthUser): Promise<User> {
    return this.prisma.user.upsert({
      where: { uid: authUser.uid },
      create: {
        uid: authUser.uid,
        userId: authUser.uid,
        name: authUser.name ?? '',
        email: authUser.email ?? null,
        age: '',
        gender: '',
        changeCount: 0,
        point: 0,
        change: true,
        response: true,
        role: authUser.role,
      },
      update: {},
    });
  }

  // ── 도메인 서비스 내부 전용 원자적 연산 (포인트/좌석변경 도메인에서 재사용) ──

  /** 포인트 원자 증감. 트랜잭션 컨텍스트(tx)를 넘기면 그 안에서 실행된다. */
  addPoint(
    uid: string,
    amount: number,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { uid },
      data: { point: { increment: amount } },
    });
  }

  /** 좌석 변경 횟수 원자 증가. */
  incrementChangeCount(
    uid: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { uid },
      data: { changeCount: { increment: 1 } },
    });
  }

  private toProfile(user: User): UserProfileDto {
    return {
      uid: user.uid,
      userId: user.userId,
      name: user.name,
      age: user.age,
      gender: user.gender,
      changeCount: user.changeCount,
      point: user.point,
      change: user.change,
      response: user.response,
      role: user.role,
    };
  }
}

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

  async getMe(authUser: AuthUser): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { email: authUser.email } });
    if (!user) throw new AppException(ErrorCode.USER_NOT_FOUND, '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    return this.toProfile(user);
  }

  async createUser(data: {
    email: string;
    hashedPassword: string;
    name: string;
    age?: number;
    gender?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        userId: data.email,
        name: data.name,
        email: data.email,
        password: data.hashedPassword,
        age: data.age ?? null,
        gender: data.gender ?? null,
        seatChageCount: 0,
        point: 0,
        notifiChange: true,
        notifResponse: true,
        role: 'user',
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** 이메일 중복 확인. 회원가입 이전 단계에서 호출 (인증 불필요). */
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    return { exists: !!user };
  }

  async getPublicProfile(userId: string): Promise<PublicUserDto> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    return { userId: user.userId, name: user.name };
  }

  async updateProfile(
    authUser: AuthUser,
    dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { email: authUser.email },
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

  async updateNotificationSettings(
    authUser: AuthUser,
    dto: UpdateNotificationSettingsDto,
  ): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { email: authUser.email },
      data: {
        ...(dto.notifiChange !== undefined ? { notifiChange: dto.notifiChange } : {}),
        ...(dto.notifResponse !== undefined ? { notifResponse: dto.notifResponse } : {}),
      },
    });
    return this.toProfile(user);
  }

  async ensureUser(email: string, name?: string, role: 'user' | 'admin' = 'user'): Promise<User> {
    return this.prisma.user.upsert({
      where: { email },
      create: {
        userId: email,
        name: name ?? '',
        email,
        age: null,
        gender: null,
        seatChageCount: 0,
        point: 0,
        notifiChange: true,
        notifResponse: true,
        role,
      },
      update: {},
    });
  }

  addPoint(
    email: string,
    amount: number,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { email },
      data: { point: { increment: amount } },
    });
  }

  incrementChangeCount(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { email },
      data: { seatChageCount: { increment: 1 } },
    });
  }

  toProfilePublic(user: User): UserProfileDto {
    return this.toProfile(user);
  }

  private toProfile(user: User): UserProfileDto {
    return {
      idx: Number(user.idx),
      userId: user.userId,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      seatChageCount: user.seatChageCount,
      point: user.point,
      notifiChange: user.notifiChange,
      notifResponse: user.notifResponse,
      role: user.role,
    };
  }
}

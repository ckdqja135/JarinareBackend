import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// 응답에서 비밀번호를 제외한 안전한 사용자 타입
export type SafeUser = Omit<User, 'password'>;

const BCRYPT_ROUNDS = 10;
// 모든 조회에서 password 컬럼을 제외한다.
const OMIT_PASSWORD = { password: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const password = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);
    try {
      return await this.prisma.user.create({
        data: { ...createUserDto, password },
        omit: OMIT_PASSWORD,
      });
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({ omit: OMIT_PASSWORD });
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: OMIT_PASSWORD,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // 인증 전용: 비밀번호 해시를 포함한 전체 레코드를 반환한다.
  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const data: Prisma.UserUpdateInput = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, BCRYPT_ROUNDS);
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        omit: OMIT_PASSWORD,
      });
    } catch (error) {
      throw this.toHttpError(error, id);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw this.toHttpError(error, id);
    }
  }

  // Prisma 에러를 적절한 HTTP 예외로 변환한다.
  private toHttpError(error: unknown, id?: number): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 레코드 없음 (update/delete 대상이 존재하지 않음)
      if (error.code === 'P2025') {
        return new NotFoundException(`User with id ${id} not found`);
      }
      // 유니크 제약 위반 (username / email 중복)
      // MySQL/MariaDB 는 meta.target 이 문자열(제약 이름), 다른 DB 는 배열일 수 있다.
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target)
          ? target.join(', ')
          : typeof target === 'string'
            ? target
            : '중복된 값';
        return new ConflictException(`이미 사용 중인 값입니다: ${fields}`);
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}

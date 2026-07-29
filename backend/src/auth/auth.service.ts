import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  generateAccessToken(user: Pick<User, 'idx' | 'email' | 'role'>): string {
    return this.jwtService.sign({
      sub: Number(user.idx),
      email: user.email,
      role: user.role,
    });
  }

  async generateTokenPair(user: Pick<User, 'idx' | 'email' | 'role'>): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.idx);
    return { accessToken, refreshToken };
  }

  private async createRefreshToken(userIdx: bigint): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.config.refreshTokenExpiresDays);

    await this.prisma.user.update({
      where: { idx: userIdx },
      data: { refreshToken: token, refreshTokenExpiresAt: expiresAt },
    });

    return token;
  }

  async rotateRefreshToken(oldToken: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { refreshToken: oldToken },
    });

    if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
      if (user) {
        await this.prisma.user.update({
          where: { idx: user.idx },
          data: { refreshToken: null, refreshTokenExpiresAt: null },
        });
      }
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }

    return this.generateTokenPair(user);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { refreshToken: token },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    });
  }
}

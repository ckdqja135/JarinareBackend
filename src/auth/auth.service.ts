import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // 아이디/비밀번호를 DB 사용자와 검증한 뒤 액세스 토큰을 발급한다.
  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(username);
    // 사용자가 없거나 비밀번호가 일치하지 않으면 동일한 오류를 반환한다. (사용자 존재 여부 노출 방지)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`로그인 실패: ${username}`);
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const payload: JwtPayload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    this.logger.log(`로그인 성공: ${username}`);
    return { access_token };
  }
}

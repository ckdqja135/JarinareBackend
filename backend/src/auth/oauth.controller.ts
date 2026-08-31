import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import type { Response } from "express";
import { Public } from "./decorators/public.decorator";
import { Cookie } from "./decorators/cookie.decorator";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { UsersService } from "../users/users.service";
import { AppConfigService } from "../config/app-config.service";

const REFRESH_TOKEN_COOKIE = "refresh_token";

@ApiTags("oauth")
@Controller("oauth")
export class OAuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly config: AppConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: this.config.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
  }

  @Public()
  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "회원가입" })
  @ApiOkResponse({ type: AuthResponseDto })
  async signup(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException("이미 사용 중인 이메일입니다.");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email: dto.email,
      hashedPassword,
      name: dto.name,
      age: dto.age,
      gender: dto.gender,
    });

    const { accessToken, refreshToken } =
      await this.authService.generateTokenPair(user);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: this.usersService.toProfilePublic(user) };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그인" })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException(
        "이메일 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        "이메일 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    const { accessToken, refreshToken } =
      await this.authService.generateTokenPair(user);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: this.usersService.toProfilePublic(user) };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "액세스 토큰 갱신" })
  async refresh(
    @Cookie(REFRESH_TOKEN_COOKIE) oldToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    if (!oldToken) throw new UnauthorizedException("리프레시 토큰이 없습니다.");

    const { accessToken, refreshToken } =
      await this.authService.rotateRefreshToken(oldToken);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "로그아웃 (리프레시 토큰 무효화)" })
  async logout(
    @Cookie(REFRESH_TOKEN_COOKIE) token: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    if (token) await this.authService.revokeRefreshToken(token);
    this.clearRefreshCookie(res);
  }
}

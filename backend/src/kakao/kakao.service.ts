import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { isAxiosError } from 'axios';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { AppConfigService } from '../config/app-config.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code';
import { UsersService } from '../users/users.service';
import { KakaoTokenDto } from './dto/kakao-token.dto';
import {
  KakaoLoginResponseDto,
  KakaoTokenResponseDto,
} from './dto/kakao-response.dto';

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const KAKAO_ISSUER = 'https://kauth.kakao.com';
const KAKAO_JWKS_URL = 'https://kauth.kakao.com/.well-known/jwks.json';

interface KakaoRawTokenResponse {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
}

@Injectable()
export class KakaoService {
  private readonly logger = new Logger(KakaoService.name);
  private readonly jwks = createRemoteJWKSet(new URL(KAKAO_JWKS_URL));

  constructor(
    private readonly config: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly users: UsersService,
  ) {}

  async exchangeToken(dto: KakaoTokenDto): Promise<KakaoTokenResponseDto> {
    this.assertRedirectUri(dto.redirectUri);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.kakaoClientId,
      client_secret: this.config.kakaoClientSecret,
      redirect_uri: dto.redirectUri,
      code: dto.code,
    });

    let raw: KakaoRawTokenResponse;
    try {
      const res = await axios.post<KakaoRawTokenResponse>(
        KAKAO_TOKEN_URL,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          timeout: this.config.trainApiTimeoutMs,
        },
      );
      raw = res.data;
    } catch (error) {
      this.logger.warn(
        `카카오 토큰 교환 실패: ${
          isAxiosError(error) && error.response
            ? `status=${error.response.status}`
            : 'network'
        }`,
      );
      throw new AppException(
        ErrorCode.KAKAO_TOKEN_EXCHANGE_FAILED,
        '카카오 토큰 교환에 실패했습니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!raw.access_token || !raw.id_token) {
      throw new AppException(
        ErrorCode.KAKAO_TOKEN_EXCHANGE_FAILED,
        '카카오 토큰 응답이 올바르지 않습니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return {
      access_token: raw.access_token,
      id_token: raw.id_token,
      token_type: raw.token_type ?? 'bearer',
      ...(raw.expires_in !== undefined ? { expires_in: raw.expires_in } : {}),
    };
  }

  async login(dto: KakaoTokenDto): Promise<KakaoLoginResponseDto> {
    const token = await this.exchangeToken(dto);
    const payload = await this.verifyIdToken(token.id_token);

    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) {
      throw new AppException(
        ErrorCode.KAKAO_ID_TOKEN_INVALID,
        '카카오 ID 토큰이 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const email = typeof payload.email === 'string' ? payload.email : undefined;
    const name = typeof payload.nickname === 'string' ? payload.nickname : undefined;

    if (!email) {
      throw new AppException(
        ErrorCode.KAKAO_ID_TOKEN_INVALID,
        '카카오 계정에 이메일 정보가 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.users.ensureUser(email, name, 'user');

    const accessToken = this.jwtService.sign({
      sub: Number(user.idx),
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  async verifyIdToken(idToken: string, nonce?: string): Promise<JWTPayload> {
    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(idToken, this.jwks, {
        issuer: KAKAO_ISSUER,
        audience: this.config.kakaoClientId,
      });
      payload = verified.payload;
    } catch (error) {
      this.logger.warn(
        `카카오 id_token 검증 실패: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      throw new AppException(
        ErrorCode.KAKAO_ID_TOKEN_INVALID,
        '카카오 ID 토큰 검증에 실패했습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (nonce !== undefined && payload.nonce !== nonce) {
      throw new AppException(
        ErrorCode.KAKAO_ID_TOKEN_INVALID,
        'nonce 가 일치하지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return payload;
  }

  private assertRedirectUri(redirectUri: string): void {
    const allowed = this.config.kakaoAllowedRedirectUris;
    if (allowed.length > 0 && !allowed.includes(redirectUri)) {
      throw new AppException(
        ErrorCode.INVALID_KAKAO_REDIRECT_URI,
        '허용되지 않은 redirectUri 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

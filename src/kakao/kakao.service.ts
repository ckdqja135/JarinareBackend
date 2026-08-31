import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { isAxiosError } from 'axios';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { AppConfigService } from '../config/app-config.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code';
import { FirebaseService } from '../firebase/firebase.service';
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
  // Kakao 공개키 세트 (지연 로딩 — 최초 검증 시 fetch)
  private readonly jwks = createRemoteJWKSet(new URL(KAKAO_JWKS_URL));

  constructor(
    private readonly config: AppConfigService,
    private readonly firebase: FirebaseService,
    private readonly users: UsersService,
  ) {}

  /**
   * 인가 코드 → 카카오 토큰 교환. client_secret 은 서버 환경변수만 사용한다.
   * 프론트엔드는 반환된 id_token 으로 기존 Firebase OAuthProvider 흐름을 유지할 수 있다.
   */
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
      // 인가 코드/토큰/원본 오류를 로그·응답에 남기지 않는다. (상태코드만)
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

  /**
   * 백엔드 세션 방식 로그인: 토큰 교환 → id_token 검증 → Firebase Custom Token 발급.
   * 로그인 성공 시 사용자 레코드가 없으면 기본값으로 생성한다.
   */
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

    const uid = `kakao:${sub}`;
    const name =
      typeof payload.nickname === 'string' ? payload.nickname : undefined;
    const email = typeof payload.email === 'string' ? payload.email : undefined;

    // 사용자 기본 데이터 보장 (멱등)
    await this.users.ensureUser({ uid, name, email, role: 'user' });

    const firebaseToken = await this.firebase.createCustomToken(uid);
    return { firebaseToken, uid };
  }

  /**
   * 카카오 id_token 검증: 서명(JWKS), issuer, audience, 만료(exp)를 검증한다.
   * nonce 가 주어지면 함께 검증한다.
   */
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

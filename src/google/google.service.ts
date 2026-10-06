import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios, { isAxiosError } from "axios";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { AppConfigService } from "../config/app-config.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { UsersService } from "../users/users.service";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { GoogleLoginResponseDto } from "./dto/google-response.dto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ISSUER = "https://accounts.google.com";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

interface GoogleRawTokenResponse {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
}

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private readonly jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

  constructor(
    private readonly config: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly users: UsersService,
  ) {}

  async login(dto: GoogleLoginDto): Promise<GoogleLoginResponseDto> {
    const idToken = await this.exchangeToken(dto);
    const payload = await this.verifyIdToken(idToken);

    const email = typeof payload.email === "string" ? payload.email : undefined;
    const name = typeof payload.name === "string" ? payload.name : undefined;

    if (!email) {
      throw new AppException(
        ErrorCode.GOOGLE_ID_TOKEN_INVALID,
        "구글 계정에 이메일 정보가 없습니다.",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.users.ensureUser(email, name, "user");

    const accessToken = this.jwtService.sign({
      sub: Number(user.idx),
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  private async exchangeToken(dto: GoogleLoginDto): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.config.googleClientId,
      client_secret: this.config.googleClientSecret,
      redirect_uri: dto.redirectUri,
      code: dto.code,
    });

    let raw: GoogleRawTokenResponse;
    try {
      const res = await axios.post<GoogleRawTokenResponse>(
        GOOGLE_TOKEN_URL,
        body.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      raw = res.data;
    } catch (error) {
      this.logger.warn(
        `구글 토큰 교환 실패: ${
          isAxiosError(error) && error.response
            ? `status=${error.response.status}`
            : "network"
        }`,
      );
      throw new AppException(
        ErrorCode.GOOGLE_TOKEN_EXCHANGE_FAILED,
        "구글 토큰 교환에 실패했습니다.",
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!raw.id_token) {
      throw new AppException(
        ErrorCode.GOOGLE_TOKEN_EXCHANGE_FAILED,
        "구글 토큰 응답에 id_token이 없습니다.",
        HttpStatus.BAD_GATEWAY,
      );
    }

    return raw.id_token;
  }

  private async verifyIdToken(idToken: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(idToken, this.jwks, {
        issuer: [GOOGLE_ISSUER, "accounts.google.com"],
        audience: this.config.googleClientId,
      });
      return payload;
    } catch (error) {
      this.logger.warn(
        `구글 id_token 검증 실패: ${error instanceof Error ? error.message : "unknown"}`,
      );
      throw new AppException(
        ErrorCode.GOOGLE_ID_TOKEN_INVALID,
        "구글 ID 토큰 검증에 실패했습니다.",
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

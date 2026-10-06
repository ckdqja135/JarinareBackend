import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios, { isAxiosError } from "axios";
import { AppConfigService } from "../config/app-config.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { UsersService } from "../users/users.service";
import { GithubLoginDto } from "./dto/github-login.dto";
import { GithubLoginResponseDto } from "./dto/github-response.dto";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

interface GithubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
}

interface GithubUser {
  name?: string | null;
  email?: string | null;
  login?: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly users: UsersService,
  ) {}

  async login(dto: GithubLoginDto): Promise<GithubLoginResponseDto> {
    const accessToken = await this.exchangeToken(dto);
    const { email, name } = await this.getUserInfo(accessToken);

    const user = await this.users.ensureUser(email, name ?? undefined, "user");

    const jwtToken = this.jwtService.sign({
      sub: Number(user.idx),
      email: user.email,
      role: user.role,
    });

    return { accessToken: jwtToken };
  }

  private async exchangeToken(dto: GithubLoginDto): Promise<string> {
    const body = new URLSearchParams({
      client_id: this.config.githubClientId,
      client_secret: this.config.githubClientSecret,
      code: dto.code,
      ...(dto.redirectUri ? { redirect_uri: dto.redirectUri } : {}),
    });

    let raw: GithubTokenResponse;
    try {
      const res = await axios.post<GithubTokenResponse>(
        GITHUB_TOKEN_URL,
        body.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        },
      );
      raw = res.data;
    } catch (error) {
      this.logger.warn(
        `깃허브 토큰 교환 실패: ${
          isAxiosError(error) && error.response
            ? `status=${error.response.status}`
            : "network"
        }`,
      );
      throw new AppException(
        ErrorCode.GITHUB_TOKEN_EXCHANGE_FAILED,
        "깃허브 토큰 교환에 실패했습니다.",
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (raw.error || !raw.access_token) {
      this.logger.warn(`깃허브 토큰 교환 오류: ${raw.error}`);
      throw new AppException(
        ErrorCode.GITHUB_TOKEN_EXCHANGE_FAILED,
        "깃허브 인가 코드가 올바르지 않습니다.",
        HttpStatus.BAD_GATEWAY,
      );
    }

    return raw.access_token;
  }

  private async getUserInfo(
    accessToken: string,
  ): Promise<{ email: string; name: string | null }> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };

    // 기본 사용자 정보 조회
    let githubUser: GithubUser;
    try {
      const res = await axios.get<GithubUser>(GITHUB_USER_URL, { headers });
      githubUser = res.data;
    } catch {
      throw new AppException(
        ErrorCode.GITHUB_USER_INFO_FAILED,
        "깃허브 사용자 정보를 가져오지 못했습니다.",
        HttpStatus.BAD_GATEWAY,
      );
    }

    // public email 있으면 바로 사용
    if (githubUser.email) {
      return { email: githubUser.email, name: githubUser.name ?? null };
    }

    // public email 없는 경우 emails API로 primary verified email 조회
    try {
      const res = await axios.get<GithubEmail[]>(GITHUB_EMAILS_URL, {
        headers,
      });
      const primary = res.data.find((e) => e.primary && e.verified);
      if (primary) {
        return { email: primary.email, name: githubUser.name ?? null };
      }
    } catch {
      // emails API 실패는 무시하고 아래에서 에러 처리
    }

    throw new AppException(
      ErrorCode.GITHUB_EMAIL_NOT_FOUND,
      "깃허브 계정에 공개된 이메일이 없습니다. 깃허브 설정에서 이메일을 공개해주세요.",
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

jest.mock("axios", () => ({
  __esModule: true,
  default: { post: jest.fn() },
  isAxiosError: jest.fn(() => false),
}));
jest.mock("jose", () => ({
  createRemoteJWKSet: jest.fn(() => "jwks"),
  jwtVerify: jest.fn(),
}));

import axios from "axios";
import { jwtVerify } from "jose";
import { KakaoService } from "./kakao.service";
import { ErrorCode } from "../common/errors/error-code";

const post = axios.post as unknown as jest.Mock;
const verify = jwtVerify as unknown as jest.Mock;

describe("KakaoService", () => {
  let config: Record<string, unknown>;
  // Firebase Custom Token 발급이 자체 JWT 발급으로 바뀌었다.
  let jwt: { sign: jest.Mock };
  let users: { ensureUser: jest.Mock };
  let service: KakaoService;

  beforeEach(() => {
    post.mockReset();
    verify.mockReset();
    config = {
      kakaoClientId: "client-123",
      kakaoClientSecret: "secret-xyz",
      kakaoAllowedRedirectUris: ["https://ok.example.com/callback"],
      trainApiTimeoutMs: 5000,
    };
    jwt = { sign: jest.fn().mockReturnValue("access-token") };
    users = {
      ensureUser: jest.fn().mockResolvedValue({
        idx: BigInt(7),
        email: "k@example.com",
        role: "user",
      }),
    };
    service = new KakaoService(config as never, jwt as never, users as never);
  });

  const validDto = {
    code: "auth-code-secret",
    redirectUri: "https://ok.example.com/callback",
  };

  it("정상 토큰 교환: 프론트 호환 필드를 반환한다", async () => {
    post.mockResolvedValue({
      data: {
        access_token: "AT",
        id_token: "IT",
        token_type: "bearer",
        expires_in: 3600,
      },
    });
    const result = await service.exchangeToken(validDto);
    expect(result).toEqual({
      access_token: "AT",
      id_token: "IT",
      token_type: "bearer",
      expires_in: 3600,
    });
  });

  it("허용되지 않은 redirectUri 는 거부한다(외부 호출 없음)", async () => {
    await expect(
      service.exchangeToken({ ...validDto, redirectUri: "https://evil.com" }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_KAKAO_REDIRECT_URI });
    expect(post).not.toHaveBeenCalled();
  });

  it("카카오 API 오류를 표준 오류로 변환한다", async () => {
    post.mockRejectedValue(new Error("kakao 400"));
    await expect(service.exchangeToken(validDto)).rejects.toMatchObject({
      code: ErrorCode.KAKAO_TOKEN_EXCHANGE_FAILED,
    });
  });

  it("오류 로그에 인가 코드/토큰을 남기지 않는다", async () => {
    const warn = jest
      .spyOn(
        (service as unknown as { logger: { warn: jest.Mock } }).logger,
        "warn",
      )
      .mockImplementation(() => undefined);
    post.mockRejectedValue(new Error("kakao 400"));
    await expect(service.exchangeToken(validDto)).rejects.toBeDefined();
    for (const call of warn.mock.calls) {
      const line = String(call[0]);
      expect(line).not.toContain("auth-code-secret");
      expect(line).not.toContain("secret-xyz");
    }
  });

  it("login: id_token 검증 후 사용자를 만들고 자체 accessToken 을 발급한다", async () => {
    post.mockResolvedValue({
      data: { access_token: "AT", id_token: "IT", token_type: "bearer" },
    });
    verify.mockResolvedValue({
      payload: { sub: "9999", nickname: "카카오유저", email: "k@example.com" },
    });
    const result = await service.login(validDto);
    expect(result).toEqual({ accessToken: "access-token" });
    expect(users.ensureUser).toHaveBeenCalledWith(
      "k@example.com",
      "카카오유저",
      "user",
    );
    // 토큰 페이로드는 가드(JwtAuthGuard)가 읽는 sub/email/role 형태여야 한다.
    expect(jwt.sign).toHaveBeenCalledWith({
      sub: 7,
      email: "k@example.com",
      role: "user",
    });
  });
});

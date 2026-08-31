import { validateEnv } from "./env.validation";

const requiredEnv = {
  TRAIN_API_BASE_URL: "https://example.com",
  TRAIN_API_SERVICE_KEY: "key",
  KAKAO_CLIENT_ID: "cid",
  KAKAO_CLIENT_SECRET: "csecret",
  // Firebase 대신 JWT 로 전환되면서 필수 시크릿이 JWT_SECRET 이 됐다.
  JWT_SECRET: "jwt-secret",
};

describe("validateEnv", () => {
  it("필수 값이 모두 있으면 통과한다", () => {
    expect(() => validateEnv({ ...requiredEnv })).not.toThrow();
  });

  it("필수 값이 누락되면 오류를 던진다", () => {
    const rest: Record<string, string> = { ...requiredEnv };
    delete rest.TRAIN_API_SERVICE_KEY;
    expect(() => validateEnv(rest)).toThrow(/환경변수 검증 실패/);
  });

  it("오류 메시지에 실제 시크릿 값을 포함하지 않는다", () => {
    const rest: Record<string, string> = { ...requiredEnv };
    delete rest.JWT_SECRET;
    try {
      validateEnv({ ...rest, TRAIN_API_SERVICE_KEY: "super-secret-value" });
      throw new Error("should have thrown");
    } catch (e) {
      expect(String((e as Error).message)).not.toContain("super-secret-value");
    }
  });
});

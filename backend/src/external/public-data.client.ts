import { Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance, isAxiosError } from "axios";
import { AppConfigService } from "../config/app-config.service";

/**
 * 공공데이터포털 열차 API 공용 클라이언트.
 *  - serviceKey / _type=json 은 서버에서만 주입한다. (클라이언트 노출 금지)
 *  - 타임아웃 및 제한적 재시도(지수 백오프)를 적용한다.
 *  - 원본 오류/서비스키는 로그에 남기지 않고 메시지 수준만 기록한다.
 */
@Injectable()
export class PublicDataClient {
  private readonly logger = new Logger(PublicDataClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: AppConfigService) {
    this.http = axios.create({
      baseURL: config.trainApiBaseUrl,
      timeout: config.trainApiTimeoutMs,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * 외부 API GET 호출. 성공 시 응답 본문(data)을 그대로 반환한다.
   * 실패 시 원본 오류를 던지며(서비스키 포함된 config 는 로그에 남기지 않음),
   * 호출자는 이를 표준 오류(EXTERNAL_TRAIN_API_ERROR 등)로 감싼다.
   */
  async get<T = unknown>(
    path: string,
    params: Record<string, unknown>,
  ): Promise<T> {
    const retries = Math.max(0, this.config.trainApiRetryCount);
    const merged = {
      ...params,
      serviceKey: this.config.trainApiServiceKey,
      _type: "json",
    };

    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await this.http.get<T>(path, { params: merged });
        return res.data;
      } catch (error) {
        lastError = error;
        if (attempt === retries || !this.isRetryable(error)) break;
        await this.delay(this.backoffMs(attempt));
      }
    }

    this.logger.error(
      `외부 API 호출 실패 path=${path} reason=${this.safeReason(lastError)}`,
    );
    throw lastError instanceof Error
      ? lastError
      : new Error("external api error");
  }

  private isRetryable(error: unknown): boolean {
    if (!isAxiosError(error)) return false;
    // 응답 없음(네트워크/타임아웃) 또는 5xx 는 재시도한다. 4xx 는 재시도하지 않는다.
    if (!error.response) return true;
    return error.response.status >= 500;
  }

  /** 서비스키가 포함될 수 있는 config 는 제외하고 안전한 사유만 추출한다. */
  private safeReason(error: unknown): string {
    if (isAxiosError(error)) {
      return error.response
        ? `status=${error.response.status}`
        : (error.code ?? "network");
    }
    return error instanceof Error ? error.message : "unknown";
  }

  private backoffMs(attempt: number): number {
    return Math.min(1000 * 2 ** attempt, 3000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

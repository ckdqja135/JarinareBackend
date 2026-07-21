import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 환경변수를 도메인 의미에 맞는 타입/기본값으로 변환해 제공하는 중앙 설정 서비스.
 * 각 서비스는 process.env 를 직접 읽지 않고 이 서비스를 주입받아 사용한다.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  private num(key: string, fallback: number): number {
    const raw = this.config.get<string>(key);
    if (raw === undefined || raw === null || raw === '') return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  private bool(key: string, fallback: boolean): boolean {
    const raw = this.config.get<string>(key);
    if (raw === undefined || raw === null || raw === '') return fallback;
    return raw.toLowerCase() === 'true' || raw === '1';
  }

  private str(key: string, fallback = ''): string {
    return this.config.get<string>(key) ?? fallback;
  }

  // ── 공통 ─────────────────────────────────────────────
  get timezone(): string {
    return this.str('APP_TIMEZONE', 'Asia/Seoul');
  }

  // ── 공공데이터 열차 API ───────────────────────────────
  get trainApiBaseUrl(): string {
    return this.str('TRAIN_API_BASE_URL');
  }

  /** 서버 내부에서만 사용. 응답/로그에 절대 노출 금지. */
  get trainApiServiceKey(): string {
    return this.str('TRAIN_API_SERVICE_KEY');
  }

  get trainApiTimeoutMs(): number {
    return this.num('TRAIN_API_TIMEOUT_MS', 5000);
  }

  get trainApiRetryCount(): number {
    return this.num('TRAIN_API_RETRY_COUNT', 2);
  }

  get trainTimeCacheTtlSeconds(): number {
    return this.num('TRAIN_TIME_CACHE_TTL_SECONDS', 300);
  }

  // ── 역 동기화 스케줄러 ────────────────────────────────
  get stationSyncCron(): string {
    return this.str('STATION_SYNC_CRON', '0 0 * * *');
  }

  get stationSyncInitialEnabled(): boolean {
    return this.bool('STATION_SYNC_INITIAL_ENABLED', true);
  }

  // ── 카카오 OAuth ─────────────────────────────────────
  get kakaoClientId(): string {
    return this.str('KAKAO_CLIENT_ID');
  }

  /** 서버 내부에서만 사용. 응답/로그에 절대 노출 금지. */
  get kakaoClientSecret(): string {
    return this.str('KAKAO_CLIENT_SECRET');
  }

  get kakaoRedirectUri(): string {
    return this.str('KAKAO_REDIRECT_URI');
  }

  /**
   * 허용된 redirectUri 목록. 콤마로 구분.
   * KAKAO_REDIRECT_URI 도 항상 허용 목록에 포함시킨다.
   */
  get kakaoAllowedRedirectUris(): string[] {
    const list = this.str('KAKAO_ALLOWED_REDIRECT_URIS')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const single = this.kakaoRedirectUri;
    if (single && !list.includes(single)) list.push(single);
    return list;
  }

  // ── Firebase Admin ───────────────────────────────────
  get firebaseProjectId(): string {
    return this.str('FIREBASE_PROJECT_ID');
  }

  get firebaseClientEmail(): string {
    return this.str('FIREBASE_CLIENT_EMAIL');
  }

  /**
   * Firebase 개인 키. 환경변수에서는 개행이 `\n` 문자열로 저장되므로 실제 개행으로 복원한다.
   */
  get firebasePrivateKey(): string {
    return this.str('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  }
}

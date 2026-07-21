import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

/**
 * 서버 시작 시 검증되는 환경변수 스키마.
 * 필수 값이 없으면 부트스트랩 단계에서 오류를 던져 서버가 뜨지 않도록 한다.
 *
 * 보안: 검증 실패 메시지에는 값(서비스키/시크릿/개인키)을 절대 포함하지 않고
 *       속성 이름과 제약조건만 노출한다.
 */
export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  APP_TIMEZONE?: string;

  // 공공데이터 열차 API
  @IsString()
  @IsNotEmpty()
  TRAIN_API_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  TRAIN_API_SERVICE_KEY: string;

  @IsOptional()
  @IsString()
  STATION_SYNC_CRON?: string;

  @IsOptional()
  @IsString()
  STATION_SYNC_INITIAL_ENABLED?: string;

  @IsOptional()
  @IsNumberString()
  TRAIN_API_TIMEOUT_MS?: string;

  @IsOptional()
  @IsNumberString()
  TRAIN_API_RETRY_COUNT?: string;

  @IsOptional()
  @IsNumberString()
  TRAIN_TIME_CACHE_TTL_SECONDS?: string;

  // 카카오 OAuth
  @IsString()
  @IsNotEmpty()
  KAKAO_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  KAKAO_CLIENT_SECRET: string;

  @IsOptional()
  @IsString()
  KAKAO_REDIRECT_URI?: string;

  @IsOptional()
  @IsString()
  KAKAO_ALLOWED_REDIRECT_URIS?: string;

  // Firebase Admin
  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PRIVATE_KEY: string;
}

/**
 * ConfigModule.forRoot({ validate }) 에서 사용하는 검증 함수.
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    // 오류 메시지에 실제 값이 들어가지 않도록 대상 객체를 노출하지 않는다.
    validationError: { target: false, value: false },
  });

  if (errors.length > 0) {
    const summary = errors
      .map(
        (e) => `${e.property}(${Object.keys(e.constraints ?? {}).join(',')})`,
      )
      .join('; ');
    throw new Error(`환경변수 검증 실패: ${summary}`);
  }

  return validated;
}

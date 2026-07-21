import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { validateEnv } from './env.validation';

/**
 * 전역 설정 모듈.
 *  - @nestjs/config 로 .env 를 로드하고 validateEnv 로 필수 값 검증(누락 시 부트스트랩 실패)
 *  - AppConfigService 로 타입/기본값이 적용된 설정 값을 제공
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}

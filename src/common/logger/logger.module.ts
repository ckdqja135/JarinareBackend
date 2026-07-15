import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { winstonConfig } from './winston.config';

/**
 * 로깅 관련 설정을 한곳에 모은 모듈.
 *  - WinstonModule: 애플리케이션 전역 로거(파일 + 콘솔)
 *    파일 압축/보관 주기는 winston-daily-rotate-file 이 직접 관리한다.
 *  - LoggingInterceptor: 모든 HTTP 요청 로깅
 */
@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class LoggerModule {}

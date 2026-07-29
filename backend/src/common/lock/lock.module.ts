import { Global, Module } from '@nestjs/common';
import { DbLockService } from './db-lock.service';

/**
 * 전역 분산 락 모듈. 스케줄러/배치 도메인에서 DbLockService 를 재사용한다.
 */
@Global()
@Module({
  providers: [DbLockService],
  exports: [DbLockService],
})
export class LockModule {}

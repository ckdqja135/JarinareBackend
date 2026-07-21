import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * 인증/권한 모듈.
 *  - FirebaseAuthGuard: 전역 인증(모든 라우트에 Firebase ID 토큰 검증, @Public() 제외)
 *  - RolesGuard: 전역 권한(@Roles() 지정 라우트)
 *
 * 전역 가드 등록 순서가 실행 순서를 결정하므로 인증 → 권한 순서로 등록한다.
 */
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}

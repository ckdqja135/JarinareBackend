import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

/**
 * 전역 Firebase 모듈. 인증 가드/카카오/사용자 등 어디서든 FirebaseService 를 주입받는다.
 */
@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}

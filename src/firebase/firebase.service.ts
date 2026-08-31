import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { AppConfigService } from '../config/app-config.service';

/**
 * Firebase Admin SDK 를 감싼 프로바이더.
 *  - 환경변수(FIREBASE_*)로 서비스 계정을 구성해 Admin 앱을 초기화한다.
 *  - ID 토큰 검증, Custom Token 발급 등 Admin 기능의 단일 진입점.
 *
 * 자격증명이 잘못되었거나 없을 때는 초기화를 건너뛰고(경고 로그) 서버는 계속 뜬다.
 * 이 경우 verifyIdToken 등은 호출 시점에 실패한다. (개발/CI 부트 편의)
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;

  constructor(private readonly config: AppConfigService) {}

  onModuleInit(): void {
    const existing = getApps();
    if (existing.length > 0) {
      this.app = existing[0];
      return;
    }
    try {
      this.app = initializeApp({
        credential: cert({
          projectId: this.config.firebaseProjectId,
          clientEmail: this.config.firebaseClientEmail,
          privateKey: this.config.firebasePrivateKey,
        }),
      });
      this.logger.log('Firebase Admin 초기화 완료');
    } catch (e) {
      // 서비스 키 값은 로그에 남기지 않는다. (메시지만)
      this.logger.warn(
        `Firebase Admin 초기화 실패 - 인증 기능이 비활성화됩니다: ${
          e instanceof Error ? e.message : 'unknown'
        }`,
      );
      this.app = null;
    }
  }

  private ensureApp(): App {
    if (!this.app) {
      throw new Error('Firebase Admin 이 초기화되지 않았습니다.');
    }
    return this.app;
  }

  auth(): Auth {
    return getAuth(this.ensureApp());
  }

  /** 클라이언트 Firebase ID 토큰을 검증하고 디코딩된 토큰을 반환한다. */
  verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    return this.auth().verifyIdToken(idToken);
  }

  /** 서버 세션/커스텀 로그인용 Firebase Custom Token 발급. */
  createCustomToken(
    uid: string,
    claims?: Record<string, unknown>,
  ): Promise<string> {
    return this.auth().createCustomToken(uid, claims);
  }
}

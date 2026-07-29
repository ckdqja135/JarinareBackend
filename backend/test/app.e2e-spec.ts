import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

// 앱 부트스트랩 전에 필수 환경변수를 더미 값으로 채운다.
// (Firebase/Kakao 실제 자격증명 없이도 부팅되도록 FirebaseService 는 관대하게 초기화한다.)
process.env.TRAIN_API_BASE_URL ??= 'https://example.com';
process.env.TRAIN_API_SERVICE_KEY ??= 'dummy';
process.env.KAKAO_CLIENT_ID ??= 'dummy';
process.env.KAKAO_CLIENT_SECRET ??= 'dummy';
process.env.FIREBASE_PROJECT_ID ??= 'dummy';
process.env.FIREBASE_CLIENT_EMAIL ??= 'dummy@example.com';
process.env.FIREBASE_PRIVATE_KEY ??= 'dummy';
// e2e 부팅 시 외부 API 초기 동기화를 하지 않도록 비활성화
process.env.STATION_SYNC_INITIAL_ENABLED = 'false';

// 참고: 이 e2e 는 MariaDB 연결이 필요하다. (AppModule 이 PrismaService 를 초기화)
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/api (GET) - 헬스체크', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});

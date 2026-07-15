// .env 로드는 다른 모듈이 process.env 를 읽기 전에 가장 먼저 실행되어야 한다.
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  // bufferLogs: winston 로거가 준비되기 전의 부트스트랩 로그도 버퍼링했다가 출력
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // NestJS 기본 로거를 winston 로거로 교체
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LockModule } from './common/lock/lock.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './config/config.module';
import { FirebaseModule } from './firebase/firebase.module';
import { KakaoModule } from './kakao/kakao.module';
import { PrismaModule } from './prisma/prisma.module';
import { StationsModule } from './stations/stations.module';
import { TrainsModule } from './trains/trains.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // 전역 인프라 모듈
    ConfigModule,
    LoggerModule,
    PrismaModule,
    FirebaseModule,
    LockModule,
    ScheduleModule.forRoot(),
    AuthModule,
    // 도메인 모듈 (Pass 1: 사용자/역/열차시간/카카오)
    UsersModule,
    StationsModule,
    TrainsModule,
    KakaoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 전역 예외 필터: 표준 { statusCode, code, message } 응답
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

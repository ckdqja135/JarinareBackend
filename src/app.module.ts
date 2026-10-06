import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LockModule } from "./common/lock/lock.module";
import { LoggerModule } from "./common/logger/logger.module";
import { ConfigModule } from "./config/config.module";
import { BoardModule } from "./board/board.module";
import { CommentModule } from "./comment/comment.module";
import { NotificationModule } from "./notification/notification.module";
import { UploadModule } from "./upload/upload.module";
import { GithubModule } from "./github/github.module";
import { GoogleModule } from "./google/google.module";
import { KakaoModule } from "./kakao/kakao.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { SeatModule } from "./seat/seat.module";
import { PointModule } from "./point/point.module";
import { TravelStatModule } from "./travel-stat/travel-stat.module";
import { StationsModule } from "./stations/stations.module";
import { TrainsModule } from "./trains/trains.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    // 전역 인프라 모듈
    ConfigModule,
    LoggerModule,
    PrismaModule,
    LockModule,
    ScheduleModule.forRoot(),
    SchedulerModule,
    AuthModule,
    // 도메인 모듈
    UsersModule,
    BoardModule,
    CommentModule,
    NotificationModule,
    SeatModule,
    PointModule,
    TravelStatModule,
    UploadModule,
    StationsModule,
    TrainsModule,
    KakaoModule,
    GoogleModule,
    GithubModule,
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

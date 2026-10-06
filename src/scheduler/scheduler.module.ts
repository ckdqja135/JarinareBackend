import { Module } from "@nestjs/common";
import { AdminSchedulerController } from "./admin-scheduler.controller";
import { JobQueueService } from "./job-queue.service";
import { SchedulerRunLogService } from "./scheduler-run-log.service";

/**
 * 스케줄러 작업 큐 인프라 모듈.
 *  - JobQueueService: 전역 단일 FIFO 큐 엔진 (다른 모듈에서 주입해 enqueue). export.
 *  - SchedulerRunLogService / AdminSchedulerController: 실행 로그 관측·취소 API.
 *
 * 도메인 의존이 없어(PrismaModule 은 전역) 어느 도메인 모듈에서든 안전하게 import 할 수 있다.
 */
@Module({
  controllers: [AdminSchedulerController],
  providers: [JobQueueService, SchedulerRunLogService],
  exports: [JobQueueService],
})
export class SchedulerModule {}

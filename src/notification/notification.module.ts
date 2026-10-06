// @role: app/module
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationAdminController } from "./notification-admin.controller";
import { NotificationService } from "./notification.service";
import { NotificationQueueService } from "./notification-queue.service";
import { SseService } from "./sse.service";

@Module({
  controllers: [NotificationController, NotificationAdminController],
  providers: [NotificationService, NotificationQueueService, SseService],
  exports: [NotificationService],
})
export class NotificationModule {}

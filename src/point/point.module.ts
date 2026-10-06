// @role: app/module
import { Module } from "@nestjs/common";
import { PointController } from "./point.controller";
import { PointService } from "./point.service";
import { OrderHistoryService } from "./order-history.service";

@Module({
  controllers: [PointController],
  providers: [PointService, OrderHistoryService],
  exports: [PointService, OrderHistoryService],
})
export class PointModule {}

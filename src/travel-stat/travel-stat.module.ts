// @role: app/module
import { Module } from "@nestjs/common";
import { TravelStatController } from "./travel-stat.controller";
import { TravelStatService } from "./travel-stat.service";

@Module({
  controllers: [TravelStatController],
  providers: [TravelStatService],
  exports: [TravelStatService],
})
export class TravelStatModule {}

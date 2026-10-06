import { Module } from "@nestjs/common";
import { ExternalModule } from "../external/external.module";
import { AdminStationsController } from "./admin-stations.controller";
import { StationsController } from "./stations.controller";
import { StationsService } from "./stations.service";
import { StationsSyncService } from "./stations-sync.service";

@Module({
  imports: [ExternalModule],
  controllers: [StationsController, AdminStationsController],
  providers: [StationsService, StationsSyncService],
  exports: [StationsService],
})
export class StationsModule {}

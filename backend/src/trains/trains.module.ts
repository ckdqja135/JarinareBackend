import { Module } from '@nestjs/common';
import { ExternalModule } from '../external/external.module';
import { AdminTrainsController } from './admin-trains.controller';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';
import { TrainTimeSyncService } from './train-time-sync.service';

@Module({
  imports: [ExternalModule],
  controllers: [TrainsController, AdminTrainsController],
  providers: [TrainsService, TrainTimeSyncService],
})
export class TrainsModule {}

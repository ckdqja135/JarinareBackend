import { Module } from '@nestjs/common';
import { ExternalModule } from '../external/external.module';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';

@Module({
  imports: [ExternalModule],
  controllers: [TrainsController],
  providers: [TrainsService],
})
export class TrainsModule {}

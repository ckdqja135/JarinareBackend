// @role: app/module
import { Module } from "@nestjs/common";
import { NotificationModule } from "../notification/notification.module";
import { PointModule } from "../point/point.module";
import { TravelStatModule } from "../travel-stat/travel-stat.module";
import { SeatController } from "./seat.controller";
import { TripService } from "./trip.service";
import { SeatLayoutService } from "./seat-layout.service";
import { SeatQueryService } from "./seat-query.service";
import { SeatHoldService } from "./seat-hold.service";
import { ReservationService } from "./reservation.service";
import { SeatChangeService } from "./seat-change.service";

@Module({
  imports: [NotificationModule, PointModule, TravelStatModule],
  controllers: [SeatController],
  providers: [
    TripService,
    SeatLayoutService,
    SeatQueryService,
    SeatHoldService,
    ReservationService,
    SeatChangeService,
  ],
})
export class SeatModule {}

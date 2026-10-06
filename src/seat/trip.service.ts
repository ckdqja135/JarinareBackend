// @role: features/seat
// @rule: 운행편(영화의 "상영 회차") 등록·조회만 담당
import { HttpStatus, Injectable } from "@nestjs/common";
import type { TrainTrip } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { isUniqueViolation } from "./seat-db.util";
import type { UpsertTripDto } from "./dto/seat.dto";

export interface TripDto {
  tripId: number;
  trainNo: string;
  trainType: string;
  depPlaceId: string;
  arrPlaceId: string;
  depPlandTime: string;
  arrPlandTime: string;
  depName: string;
  arrName: string;
}

export const toTripDto = (t: TrainTrip): TripDto => ({
  tripId: Number(t.id),
  trainNo: t.trainNo,
  trainType: t.trainType,
  depPlaceId: t.depPlaceId,
  arrPlaceId: t.arrPlaceId,
  depPlandTime: t.depPlandTime,
  arrPlandTime: t.arrPlandTime,
  depName: t.depName,
  arrName: t.arrName,
});

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 열차 시간 조회 결과로 운행편을 찾거나 만든다.
   *
   * 같은 열차를 여러 사람이 동시에 처음 열면 둘 다 "없음" 을 보고 INSERT 한다.
   * MySQL 에서 Prisma upsert 는 조회-후-삽입이라 이 경합을 못 막으므로,
   * 먼저 INSERT 하고 UNIQUE 에 걸리면 이긴 쪽이 만든 행을 읽는다.
   */
  async upsert(dto: UpsertTripDto): Promise<TripDto> {
    const key = {
      trainNo: dto.trainNo,
      depPlaceId: dto.depPlaceId,
      arrPlaceId: dto.arrPlaceId,
      depPlandTime: dto.depPlandTime,
    };
    try {
      return toTripDto(await this.prisma.trainTrip.create({ data: dto }));
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
    }
    const existing = await this.prisma.trainTrip.findUnique({
      where: { trainNo_depPlaceId_arrPlaceId_depPlandTime: key },
    });
    return toTripDto(existing!);
  }

  async get(tripId: number | bigint): Promise<TrainTrip> {
    const trip = await this.prisma.trainTrip.findUnique({
      where: { id: BigInt(tripId) },
    });
    if (!trip) {
      throw new AppException(
        ErrorCode.TRIP_NOT_FOUND,
        "운행편을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }
    return trip;
  }
}

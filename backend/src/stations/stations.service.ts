import { HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { PrismaService } from "../prisma/prisma.service";
import { StationResponseDto } from "./dto/station-response.dto";

/**
 * 역 목록 조회 서비스. 외부 API 를 실시간 호출하지 않고 동기화된 DB 데이터를 반환한다.
 * 응답은 프론트엔드 호환을 위해 { nodeid, nodename } 만 노출한다.
 */
@Injectable()
export class StationsService {
  // 활성 역만, nodeid/nodename 만 선택
  private static readonly SELECT = { nodeid: true, nodename: true } as const;

  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<StationResponseDto[]> {
    return this.prisma.station.findMany({
      where: { isActive: true },
      select: StationsService.SELECT,
      orderBy: { nodename: "asc" },
    });
  }

  findByCity(cityCode: string): Promise<StationResponseDto[]> {
    return this.prisma.station.findMany({
      where: { isActive: true, cityCode },
      select: StationsService.SELECT,
      orderBy: { nodename: "asc" },
    });
  }

  async findById(nodeid: string): Promise<StationResponseDto> {
    const station = await this.prisma.station.findFirst({
      where: { nodeid, isActive: true },
      select: StationsService.SELECT,
    });
    if (!station) {
      throw new AppException(
        ErrorCode.STATION_NOT_FOUND,
        "역을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }
    return station;
  }
}

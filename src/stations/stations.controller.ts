import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { StationQueryDto } from "./dto/station-query.dto";
import { StationResponseDto } from "./dto/station-response.dto";
import { StationsService } from "./stations.service";

/**
 * 역 목록 조회 API (참조용 공개 데이터).
 * 외부 API 를 실시간 호출하지 않고 매일 자정 동기화된 DB 데이터를 반환한다.
 */
@ApiTags("stations")
@Controller("stations")
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: "역 목록 조회",
    description:
      "cityCode 지정 시 해당 도시의 역만, 생략 시 전체 활성 역을 반환",
  })
  @ApiOkResponse({ type: StationResponseDto, isArray: true })
  findAll(@Query() query: StationQueryDto): Promise<StationResponseDto[]> {
    return query.cityCode
      ? this.stationsService.findByCity(query.cityCode)
      : this.stationsService.findAll();
  }

  @Public()
  @Get(":stationId")
  @ApiOperation({ summary: "단일 역 조회" })
  @ApiOkResponse({ type: StationResponseDto })
  findOne(@Param("stationId") stationId: string): Promise<StationResponseDto> {
    return this.stationsService.findById(stationId);
  }
}

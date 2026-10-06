import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { TrainTimeQueryDto } from "./dto/train-time-query.dto";
import { TrainTimeResponseDto } from "./dto/train-time-response.dto";
import { TrainsService } from "./trains.service";

@ApiTags("trains")
@Controller("trains")
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Public()
  @Get("times")
  @ApiOperation({
    summary: "열차 시간 조회",
    description:
      "공공데이터 열차 시간 API 프록시. serviceKey 는 서버에서 주입한다. 날짜(depplandtime/arrplandtime)는 숫자(YYYYMMDDHHmm) 형식.",
  })
  @ApiOkResponse({ type: TrainTimeResponseDto, isArray: true })
  getTimes(@Query() query: TrainTimeQueryDto): Promise<TrainTimeResponseDto[]> {
    return this.trainsService.getTrainTimes(query);
  }
}

// @role: widgets/controller
// @rule: 목적지별 예매 통계 조회만 담당 (집계는 예매 확정 시 서버가 한다)
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { TravelStatService } from "./travel-stat.service";

@ApiTags("travel-stats")
@Controller("travel-stats")
export class TravelStatController {
  constructor(private readonly stats: TravelStatService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: "목적지별 예매 통계 (예매 많은 순, 나이대·성별 포함)",
  })
  list() {
    return this.stats.list();
  }
}

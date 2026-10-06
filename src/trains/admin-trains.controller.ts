import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { EnqueueResultDto } from "../scheduler/dto/scheduler-run.dto";
import { TrainTimeSyncRangeDto } from "./dto/train-time-sync.dto";
import { TrainTimeSyncService } from "./train-time-sync.service";
/**
 * 관리자 전용 열차 시간표 수동 사전 캐싱 API.
 * 매일 새벽 자동 실행과 별개로 기간을 선택해 온디맨드로 큐에 적재한다(비동기 배치 실행).
 * 진행 상태는 GET /admin/scheduler/runs 로 확인한다.
 */
@ApiTags("admin-trains")
@ApiBearerAuth()
@Controller("admin/trains")
export class AdminTrainsController {
  constructor(private readonly trainTimeSync: TrainTimeSyncService) {}

  @Roles("admin")
  @Post("times/sync")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: "열차 시간표 수동 사전 캐싱 (관리자) — 기간 선택 · 큐 적재",
    description:
      "고정 노선(TRAIN_ROUTES)에 대해 선택한 기간의 열차 시간표 사전 캐싱 작업을 큐에 적재한다. " +
      "startDate/endDate 또는 startDate/days 로 기간을 지정한다. 미지정 시 오늘부터 7일. " +
      "동일 기간이 이미 진행 중이면 409.",
  })
  @ApiResponse({ status: 202, type: EnqueueResultDto })
  async sync(@Body() dto: TrainTimeSyncRangeDto): Promise<EnqueueResultDto> {
    const runId = await this.trainTimeSync.enqueueRange(dto);
    return {
      runId: runId.toString(),
      jobName: "train-time-sync",
      status: "PENDING",
    };
  }
}

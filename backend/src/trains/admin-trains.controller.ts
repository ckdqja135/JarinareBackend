import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  TrainTimeSyncRangeDto,
  TrainTimeSyncResultDto,
} from './dto/train-time-sync.dto';
import { TrainTimeSyncService } from './train-time-sync.service';

/**
 * 관리자 전용 열차 시간표 수동 사전 캐싱 API.
 * 매일 새벽 자동 실행과 별개로, 기간을 선택해 온디맨드로 실행한다.
 */
@ApiTags('admin-trains')
@ApiBearerAuth()
@Controller('admin/trains')
export class AdminTrainsController {
  constructor(private readonly trainTimeSync: TrainTimeSyncService) {}

  @Roles('admin')
  @Post('times/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '열차 시간표 수동 사전 캐싱 (관리자) — 기간 선택',
    description:
      '고정 노선(TRAIN_ROUTES)에 대해 선택한 기간의 열차 시간표를 외부 API 에서 조회하여 저장한다. ' +
      'startDate/endDate 또는 startDate/days 로 기간을 지정한다. 미지정 시 오늘부터 7일.',
  })
  @ApiOkResponse({ type: TrainTimeSyncResultDto })
  sync(@Body() dto: TrainTimeSyncRangeDto): Promise<TrainTimeSyncResultDto> {
    return this.trainTimeSync.syncRange(dto);
  }
}

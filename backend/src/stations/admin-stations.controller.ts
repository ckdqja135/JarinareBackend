import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { EnqueueResultDto } from '../scheduler/dto/scheduler-run.dto';
import { StationsSyncService } from './stations-sync.service';

/**
 * 관리자 전용 역 수동 동기화 API.
 * 실제 동기화는 큐에 적재되어 배치 워커가 순차 처리한다(비동기). 진행 상태는
 * GET /admin/scheduler/runs 로 확인한다.
 */
@ApiTags('admin-stations')
@ApiBearerAuth()
@Controller('admin/stations')
export class AdminStationsController {
  constructor(private readonly stationsSyncService: StationsSyncService) {}

  @Roles('admin')
  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: '역 목록 수동 동기화 (관리자) — 큐 적재',
    description:
      '외부 API 에서 전체 역 목록을 다시 수집하는 작업을 큐에 적재한다. ' +
      '이미 진행 중이면 409. 결과는 스케줄러 실행 로그에서 확인한다.',
  })
  @ApiResponse({ status: 202, type: EnqueueResultDto })
  async sync(): Promise<EnqueueResultDto> {
    const runId = await this.stationsSyncService.enqueueManualSync();
    return { runId: runId.toString(), jobName: 'station-sync', status: 'PENDING' };
  }
}

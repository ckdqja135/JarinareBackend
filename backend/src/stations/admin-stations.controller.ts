import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { StationSyncResultDto } from './dto/station-response.dto';
import { StationsSyncService } from './stations-sync.service';

/**
 * 관리자 전용 역 수동 동기화 API.
 */
@ApiTags('admin-stations')
@ApiBearerAuth()
@Controller('admin/stations')
export class AdminStationsController {
  constructor(private readonly stationsSyncService: StationsSyncService) {}

  @Roles('admin')
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '역 목록 수동 동기화 (관리자)',
    description: '외부 API 에서 전체 역 목록을 다시 수집하여 DB 를 최신화한다.',
  })
  @ApiOkResponse({ type: StationSyncResultDto })
  sync(): Promise<StationSyncResultDto> {
    return this.stationsSyncService.syncAll();
  }
}

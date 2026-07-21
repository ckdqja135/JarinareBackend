import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * 알림 설정 수정 요청.
 *  - change: 좌석 변경 관련 알림 수신 여부
 *  - response: 좌석 변경 응답 알림 수신 여부
 */
export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ description: '좌석 변경 알림 수신 여부' })
  @IsOptional()
  @IsBoolean()
  change?: boolean;

  @ApiPropertyOptional({ description: '응답 알림 수신 여부' })
  @IsOptional()
  @IsBoolean()
  response?: boolean;
}

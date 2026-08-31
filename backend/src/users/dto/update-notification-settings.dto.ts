import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ description: "좌석 변경 알림 수신 여부" })
  @IsOptional()
  @IsBoolean()
  notifiChange?: boolean;

  @ApiPropertyOptional({ description: "응답 알림 수신 여부" })
  @IsOptional()
  @IsBoolean()
  notifResponse?: boolean;
}

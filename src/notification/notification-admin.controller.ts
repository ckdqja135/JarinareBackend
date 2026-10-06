// @role: widgets/controller
// @rule: 알림 파티션 수동 삭제 — 관리자 전용
import { Controller, Delete, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { Roles } from "../auth/decorators/roles.decorator";
import { NotificationService } from "./notification.service";

class DropPartitionQuery {
  @Type(() => Number)
  @IsNumber()
  year!: number;

  @Type(() => Number)
  @IsNumber()
  month!: number;
}

@ApiTags("admin-notification")
@ApiBearerAuth()
@Controller("admin/notification")
export class NotificationAdminController {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles("admin")
  @Delete("partition")
  @ApiOperation({
    summary: "알림 파티션 수동 삭제 (관리자)",
    description: "지정한 연도·월의 알림 파티션을 즉시 삭제한다.",
  })
  @ApiQuery({ name: "year", description: "삭제할 연도 (예: 2026)" })
  @ApiQuery({ name: "month", description: "삭제할 월 (예: 6)" })
  dropPartition(@Query() query: DropPartitionQuery) {
    return this.notificationService.dropPartition(query.year, query.month);
  }

}

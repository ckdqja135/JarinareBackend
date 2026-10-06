// @role: widgets/controller
// @rule: 조회·읽음·삭제·SSE 스트림만 담당, 알림 생성 엔드포인트 없음
import { Body, Controller, Delete, Get, Patch, Put, Query, Sse } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Observable } from "rxjs";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { NotificationService } from "./notification.service";
import { SseService } from "./sse.service";

class DeleteNotificationDto {
  @IsNumber()
  id!: number;

  @IsString()
  type!: string;
}

class UpdateNotificationDto {
  @IsNumber()
  id!: number;

  @IsString()
  type!: string;

  @IsBoolean()
  isRead!: boolean;
}

@ApiTags("notification")
@ApiBearerAuth()
@Controller("notification")
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseService: SseService,
  ) {}

  @Get()
  @ApiOperation({ summary: "내 알림 목록 조회 (year, month 쿼리 파라미터로 월별 조회 가능)" })
  @ApiQuery({ name: "year", required: false, description: "조회 연도 (예: 2026)" })
  @ApiQuery({ name: "month", required: false, description: "조회 월 (예: 8)" })
  getList(
    @Query("year") year: string | undefined,
    @Query("month") month: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    if (year && month) {
      return this.notificationService.getListByMonth(Number(year), Number(month), user);
    }
    return this.notificationService.getList(user);
  }

  @Sse("stream")
  @ApiOperation({ summary: "알림 실시간 SSE 스트림 (?token=accessToken)" })
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    return this.sseService.connect(user.idx);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "전체 알림 읽음 처리" })
  markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationService.markAllAsRead(user);
  }

  @Put()
  @ApiOperation({ summary: "단건 알림 읽음/안읽음 처리" })
  markAsRead(@Body() dto: UpdateNotificationDto, @CurrentUser() user: AuthUser) {
    return this.notificationService.markAsRead(dto, user);
  }

  @Delete()
  @ApiOperation({ summary: "단건 알림 삭제" })
  delete(@Body() dto: DeleteNotificationDto, @CurrentUser() user: AuthUser) {
    return this.notificationService.delete(dto, user);
  }
}

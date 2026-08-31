// @role: widgets/controller
// @rule: 조회·읽음·삭제·SSE 스트림만 담당, 알림 생성 엔드포인트 없음
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  MessageEvent,
  Patch,
  Put,
  Query,
  Sse,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Observable } from "rxjs";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { NotificationService } from "./notification.service";

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
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: "내 알림 목록 조회 (year, month 쿼리 파라미터로 월별 조회 가능)",
  })
  @ApiQuery({
    name: "year",
    required: false,
    description: "조회 연도 (예: 2026)",
  })
  @ApiQuery({ name: "month", required: false, description: "조회 월 (예: 8)" })
  getList(
    @Query("year") year: string | undefined,
    @Query("month") month: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    if (year && month) {
      return this.notificationService.getListByMonth(
        Number(year),
        Number(month),
        user,
      );
    }
    return this.notificationService.getList(user);
  }

  @Sse("stream")
  @ApiOperation({
    summary: "알림 실시간 SSE 스트림 (?token=accessToken)",
    description:
      "알림은 배열로 묶여 오고, 이벤트 id 에 마지막 알림 id 가 실린다. " +
      "EventSource 는 재연결 시 Last-Event-ID 헤더를 자동으로 보내므로 " +
      "끊겼던 구간의 알림이 자동으로 메워진다. 30초마다 type=ping 이벤트가 흐른다.",
  })
  @ApiQuery({
    name: "lastEventId",
    required: false,
    description: "Last-Event-ID 헤더를 못 쓰는 클라이언트용 fallback",
  })
  stream(
    @Headers("last-event-id") lastEventIdHeader: string | undefined,
    @Query("lastEventId") lastEventIdQuery: string | undefined,
    @CurrentUser() user: AuthUser,
  ): Observable<MessageEvent> {
    return this.notificationService.stream(
      user,
      lastEventIdHeader ?? lastEventIdQuery,
    );
  }

  @Patch("read-all")
  @ApiOperation({ summary: "전체 알림 읽음 처리" })
  markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationService.markAllAsRead(user);
  }

  @Put()
  @ApiOperation({ summary: "단건 알림 읽음/안읽음 처리" })
  markAsRead(
    @Body() dto: UpdateNotificationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationService.markAsRead(dto, user);
  }

  @Delete()
  @ApiOperation({ summary: "단건 알림 삭제" })
  delete(@Body() dto: DeleteNotificationDto, @CurrentUser() user: AuthUser) {
    return this.notificationService.delete(dto, user);
  }
}

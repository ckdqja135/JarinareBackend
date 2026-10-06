// @role: widgets/controller
// @rule: 좌석 배치·현황·선점·예매·변경 HTTP 경계만 담당. 배치도만 Public, 나머지는 JWT 필요
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { TripService } from "./trip.service";
import { SeatLayoutService } from "./seat-layout.service";
import { SeatQueryService } from "./seat-query.service";
import { SeatHoldService } from "./seat-hold.service";
import { ReservationService } from "./reservation.service";
import { SeatChangeService } from "./seat-change.service";
import {
  CancelReservationDto,
  ChangeRequestListQueryDto,
  CreateChangeRequestDto,
  CreateReservationDto,
  ReleaseHoldDto,
  SeatLayoutQueryDto,
  SeatSelectionDto,
  UpsertTripDto,
} from "./dto/seat.dto";

/**
 * 영화 예매 흐름을 그대로 따른다.
 *
 *   배치도 조회 → 운행편 등록 → 좌석 현황 → 선점(7분) → 예매 확정
 *                                               ↘ 선점 해제
 *   예매 이후: 취소(반환) / 좌석 변경(빈 좌석 즉시 이동, 남의 좌석은 교환 신청)
 */
@ApiTags("seats")
@Controller("seats")
export class SeatController {
  constructor(
    private readonly trips: TripService,
    private readonly layouts: SeatLayoutService,
    private readonly query: SeatQueryService,
    private readonly holds: SeatHoldService,
    private readonly reservations: ReservationService,
    private readonly changes: SeatChangeService,
  ) {}

  // ── 배치도 · 운행편 · 현황 ─────────────────────────────────────────────

  @Public()
  @Get("layout")
  @ApiOperation({
    summary: "좌석 배치도 (열차 종류 전용 배치가 없으면 기본 배치)",
  })
  getLayout(@Query() q: SeatLayoutQueryDto) {
    return this.layouts.getCars(q.trainType, q.carNo);
  }

  @ApiBearerAuth()
  @Post("trips")
  @ApiOperation({
    summary: "운행편 등록/조회",
    description:
      "열차 시간 조회 결과로 운행편을 찾거나 만든다. 같은 열차면 같은 tripId 가 돌아온다.",
  })
  upsertTrip(@Body() dto: UpsertTripDto) {
    return this.trips.upsert(dto);
  }

  @ApiBearerAuth()
  @Get("trips/:tripId/cars")
  @ApiOperation({ summary: "호차별 잔여석" })
  getTripSummary(@Param("tripId", ParseIntPipe) tripId: number) {
    return this.query.getTripSummary(tripId);
  }

  @ApiBearerAuth()
  @Get("trips/:tripId/cars/:carNo")
  @ApiOperation({
    summary: "호차 좌석 현황",
    description: "좌석마다 AVAILABLE | HELD | HELD_BY_ME | RESERVED | MINE",
  })
  getCarSeats(
    @Param("tripId", ParseIntPipe) tripId: number,
    @Param("carNo", ParseIntPipe) carNo: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.query.getCarSeats(tripId, carNo, user);
  }

  // ── 선점 ────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Post("holds")
  @ApiOperation({
    summary: "좌석 선점 (7분)",
    description:
      "여러 좌석은 전부 잡히거나 하나도 안 잡힌다. 다시 호출하면 만료 시각이 연장된다.",
  })
  hold(@Body() dto: SeatSelectionDto, @CurrentUser() user: AuthUser) {
    return this.holds.hold(dto, user);
  }

  @ApiBearerAuth()
  @Delete("holds")
  @ApiOperation({ summary: "좌석 선점 해제" })
  release(@Body() dto: ReleaseHoldDto, @CurrentUser() user: AuthUser) {
    return this.holds.release(dto, user);
  }

  // ── 예매 ────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Post("reservations")
  @ApiOperation({
    summary: "예매 확정",
    description:
      "선점한 좌석만 확정할 수 있다. 선점이 만료됐으면 SEAT_STATE_CHANGED.",
  })
  reserve(@Body() dto: CreateReservationDto, @CurrentUser() user: AuthUser) {
    return this.reservations.create(dto, user);
  }

  @ApiBearerAuth()
  @Get("reservations/me")
  @ApiOperation({ summary: "내 예매 목록" })
  listMine(@CurrentUser() user: AuthUser) {
    return this.reservations.listMine(user);
  }

  @ApiBearerAuth()
  @Delete("reservations")
  @ApiOperation({ summary: "예매 취소(반환) — 좌석 단위" })
  cancelReservation(
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservations.cancel(dto, user);
  }

  // ── 좌석 변경 ────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Post("change-requests")
  @ApiOperation({
    summary: "좌석 변경 신청",
    description:
      "빈 좌석이면 즉시 이동(status=MOVED), 남이 앉은 좌석이면 교환 신청(status=PENDING, 1분 내 응답).",
  })
  requestChange(
    @Body() dto: CreateChangeRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.changes.request(dto, user);
  }

  @ApiBearerAuth()
  @Get("change-requests")
  @ApiOperation({ summary: "받은/보낸 교환 신청 (?box=received|sent)" })
  listChangeRequests(
    @Query() q: ChangeRequestListQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.changes.list(q.box, user);
  }

  @ApiBearerAuth()
  @Post("change-requests/:id/accept")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "교환 수락 — 일행 좌석이 맞바뀌고, 수락한 사람의 변경 횟수 +1 (5회마다 2000P)",
  })
  accept(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.changes.accept(id, user);
  }

  @ApiBearerAuth()
  @Post("change-requests/:id/reject")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "교환 거절" })
  reject(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.changes.reject(id, user);
  }

  @ApiBearerAuth()
  @Delete("change-requests/:id")
  @ApiOperation({ summary: "교환 신청 철회 (신청자)" })
  cancelChange(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.changes.cancel(id, user);
  }
}

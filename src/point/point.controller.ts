// @role: widgets/controller
// @rule: 포인트 적립 내역 · 결제 내역 조회만 담당 (잔액은 /users/me 의 point)
import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { PointService } from "./point.service";
import { OrderHistoryService } from "./order-history.service";

@ApiTags("point")
@ApiBearerAuth()
@Controller()
export class PointController {
  constructor(
    private readonly points: PointService,
    private readonly orders: OrderHistoryService,
  ) {}

  @Get("points/history")
  @ApiOperation({ summary: "내 포인트 적립 내역 (최신순)" })
  listPointHistory(@CurrentUser() user: AuthUser) {
    return this.points.listHistory(user);
  }

  @Get("orders/me")
  @ApiOperation({ summary: "내 결제·반환 내역 (최신순)" })
  listOrders(@CurrentUser() user: AuthUser) {
    return this.orders.listMine(user);
  }
}

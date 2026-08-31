// @role: app/module
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}

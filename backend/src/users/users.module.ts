import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // 카카오 로그인/포인트/좌석변경 등 다른 도메인에서 UsersService 를 재사용한다.
  exports: [UsersService],
})
export class UsersModule {}

import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * 전역 모듈로 등록하여 어느 모듈에서든 PrismaService 를 주입받을 수 있게 한다.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

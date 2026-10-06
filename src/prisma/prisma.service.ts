import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

/**
 * PrismaClient 를 감싼 NestJS 프로바이더.
 * .env 의 RDB_* 값으로 MariaDB/MySQL 드라이버 어댑터를 구성한다.
 * (Prisma 7 부터는 스키마의 datasource url 대신 드라이버 어댑터를 사용한다.)
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaMariaDb({
        host: process.env.RDB_HOST ?? "localhost",
        port: Number(process.env.RDB_PORT ?? 3306),
        user: process.env.RDB_USERNAME ?? "root",
        password: process.env.RDB_PASSWORD ?? "",
        database: process.env.RDB_DATABASE ?? "test",
        // mariadb 커넥션 풀 설정
        connectionLimit: 10,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log("데이터베이스에 연결되었습니다.");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

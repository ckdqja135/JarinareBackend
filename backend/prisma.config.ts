// Prisma CLI(마이그레이션 등)가 사용하는 설정 파일.
// .env 의 RDB_* 값으로 MySQL 연결 URL 을 조합한다.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const {
  RDB_HOST = "localhost",
  RDB_PORT = "3306",
  RDB_USERNAME = "root",
  RDB_PASSWORD = "",
  RDB_DATABASE = "test",
} = process.env;

// 비밀번호에 특수문자가 있어도 안전하도록 인코딩한다.
const databaseUrl = `mysql://${RDB_USERNAME}:${encodeURIComponent(
  RDB_PASSWORD,
)}@${RDB_HOST}:${RDB_PORT}/${RDB_DATABASE}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});

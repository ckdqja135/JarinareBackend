import { Module } from "@nestjs/common";
import { PublicDataClient } from "./public-data.client";

/**
 * 외부(공공데이터) API 연동 공용 모듈. 역/열차시간 도메인에서 재사용한다.
 */
@Module({
  providers: [PublicDataClient],
  exports: [PublicDataClient],
})
export class ExternalModule {}

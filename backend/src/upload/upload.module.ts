// @role: module
// @rule: 이미지 업로드 모듈
import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller";

@Module({
  controllers: [UploadController],
})
export class UploadModule {}

// @role: controller
// @rule: 이미지 파일 업로드 전용, JWT 필요
import { existsSync, unlinkSync } from "fs";
import { basename, join } from "path";
import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuid } from "uuid";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  @ApiBearerAuth()
  @Post("board")
  @ApiOperation({ summary: "게시판 이미지 업로드" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/board",
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuid()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new BadRequestException("이미지 파일만 업로드 가능합니다."), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadBoardImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("파일이 없습니다.");
    return { imageUrl: `/uploads/board/${file.filename}` };
  }

  @ApiBearerAuth()
  @Delete("board")
  @ApiOperation({ summary: "게시판 이미지 삭제 (고아 파일 정리용)" })
  deleteBoardImage(@Body("imageUrl") imageUrl: string) {
    if (!imageUrl?.startsWith("/uploads/board/")) {
      throw new BadRequestException("유효하지 않은 경로입니다.");
    }
    const filePath = join(process.cwd(), "uploads", "board", basename(imageUrl));
    if (existsSync(filePath)) unlinkSync(filePath);
    return { message: "삭제되었습니다." };
  }
}

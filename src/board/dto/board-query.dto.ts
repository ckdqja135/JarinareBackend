// @role: entities/dto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum BoardType {
  FREE = "free",
  NOTICE = "notice",
  EVENT = "event",
  REVIEW = "review",
}

export class BoardListQueryDto {
  @ApiProperty({ enum: BoardType, description: "게시판 유형" })
  @IsEnum(BoardType)
  type!: BoardType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sort?: "asc" | "desc";
}

export class BoardDetailQueryDto {
  @ApiProperty({ enum: BoardType, description: "게시판 유형" })
  @IsEnum(BoardType)
  type!: BoardType;

  @ApiPropertyOptional({ description: "review 타입 전용" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc", description: "review 타입 전용" })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sort?: "asc" | "desc";
}

export class DeleteBoardQueryDto {
  @ApiProperty({ enum: BoardType, description: "게시판 유형" })
  @IsEnum(BoardType)
  type!: BoardType;
}

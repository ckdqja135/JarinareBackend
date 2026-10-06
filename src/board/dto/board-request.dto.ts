// @role: entities/dto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { BoardType } from "./board-query.dto";

export class CreateBoardDto {
  @ApiProperty({ enum: BoardType })
  @IsEnum(BoardType)
  type!: BoardType;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: "/uploads/board/xxx.png" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String], description: "free/review 전용" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: "review 전용, 0.0~5.0" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}

export class UpdateBoardDto {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty({ enum: BoardType })
  @IsEnum(BoardType)
  type!: BoardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: "/uploads/board/xxx.png", nullable: true })
  @IsOptional()
  @ValidateIf((o: UpdateBoardDto) => o.imageUrl !== null)
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: "review 전용, 0.0~5.0" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}

export class DeleteBoardDto {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty({ enum: BoardType })
  @IsEnum(BoardType)
  type!: BoardType;
}

export class ToggleBoardLikeDto {
  @ApiProperty()
  @IsInt()
  boardId!: number;
}

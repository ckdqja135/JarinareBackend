// @role: entities/dto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
  @ApiProperty()
  @IsInt()
  boardId!: number;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}

export class UpdateCommentDto {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty()
  @IsInt()
  boardId!: number;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}

export class DeleteCommentDto {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}

export class ToggleCommentLikeDto {
  @ApiProperty()
  @IsInt()
  commentId!: number;
}

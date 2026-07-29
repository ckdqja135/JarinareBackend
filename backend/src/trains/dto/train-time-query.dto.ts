import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class TrainTimeQueryDto {
  @ApiProperty({ description: '출발역 ID', example: 'NAT010000' })
  @IsString()
  @IsNotEmpty()
  depPlaceId: string;

  @ApiProperty({ description: '도착역 ID', example: 'NAT011668' })
  @IsString()
  @IsNotEmpty()
  arrPlaceId: string;

  @ApiProperty({
    description: '출발 예정일 (YYYYMMDD, 선택적으로 시분 포함 8~14자리 숫자)',
    example: '20260725',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,14}$/, {
    message: 'depPlandTime 은 YYYYMMDD 형식의 숫자여야 합니다.',
  })
  depPlandTime: string;

  @ApiPropertyOptional({ description: '페이지 번호', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNo?: number;

  @ApiPropertyOptional({
    description: '페이지당 행 수',
    default: 200,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  numOfRows?: number;

  @ApiPropertyOptional({ description: '열차 등급 코드', example: '00' })
  @IsOptional()
  @IsString()
  trainGradeCode?: string;
}

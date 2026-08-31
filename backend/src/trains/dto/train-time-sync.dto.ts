import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";

/**
 * 관리자 수동 사전 캐싱 요청. 기간을 선택해 호출한다.
 *  - startDate 미지정 시 오늘(Asia/Seoul)부터 시작
 *  - endDate 지정 시 [startDate, endDate] 포함 구간 (days 무시)
 *  - endDate 미지정 시 startDate 부터 days 일 (기본 7)
 */
export class TrainTimeSyncRangeDto {
  @ApiPropertyOptional({
    description: "시작일 (YYYYMMDD). 미지정 시 오늘(Asia/Seoul).",
    example: "20260728",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: "startDate 는 YYYYMMDD 형식이어야 합니다." })
  startDate?: string;

  @ApiPropertyOptional({
    description: "종료일 (YYYYMMDD, 포함). 지정하면 days 는 무시된다.",
    example: "20260803",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: "endDate 는 YYYYMMDD 형식이어야 합니다." })
  endDate?: string;

  @ApiPropertyOptional({
    description: "endDate 미지정 시 시작일 포함 저장할 일수 (1~31).",
    default: 7,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  days?: number;
}

/** 사전 캐싱 실행 결과 요약. */
export class TrainTimeSyncResultDto {
  @ApiProperty({ description: "실행 여부 (다른 실행이 진행 중이면 false)" })
  executed!: boolean;

  @ApiProperty({ description: "대상 노선 수" })
  routes!: number;

  @ApiProperty({
    description: "처리한 날짜 목록 (YYYYMMDD)",
    example: ["20260728", "20260729"],
    type: [String],
  })
  dates!: string[];

  @ApiProperty({ description: "총 작업 수 (노선 × 날짜)" })
  tasks!: number;

  @ApiProperty({ description: "저장 성공한 작업 수" })
  succeeded!: number;

  @ApiProperty({ description: "실패한 작업 수" })
  failed!: number;
}

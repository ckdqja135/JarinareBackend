import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** 실행 로그 목록 조회 쿼리. */
export class SchedulerRunQueryDto {
  @ApiPropertyOptional({
    description: '가져올 개수 (1~500)',
    default: 50,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional({
    description: '작업 이름 필터 (예: station-sync, train-time-sync)',
  })
  @IsOptional()
  @IsString()
  jobName?: string;

  @ApiPropertyOptional({
    description: '상태 필터 (PENDING|RUNNING|SUCCESS|FAILED|CANCELLED)',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

/** 큐 적재 결과. 실제 실행은 비동기(배치 워커)로 진행된다. */
export class EnqueueResultDto {
  @ApiProperty({ description: '적재된 작업의 runId', example: '123' })
  runId: string;

  @ApiProperty({ description: '작업 이름', example: 'station-sync' })
  jobName: string;

  @ApiProperty({ description: '적재 직후 상태', example: 'PENDING' })
  status: string;
}

/** 실행 로그 항목 (Swagger 응답 문서화용). */
export class SchedulerRunLogItemDto {
  @ApiProperty({ example: '123' })
  runId: string;

  @ApiProperty({ example: 'train-time-sync' })
  jobName: string;

  @ApiProperty({ example: 'SUCCESS' })
  status: string;

  @ApiProperty({ example: '20260729' })
  startYmd: string;

  @ApiProperty({ example: '20260804' })
  endYmd: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  endedAt: Date | null;

  @ApiProperty({ nullable: true })
  errorMessage: string | null;

  @ApiProperty({
    nullable: true,
    description: '실행 결과 요약(JSON)',
  })
  metadata: unknown;
}

/** 작업 취소 결과. */
export class CancelResultDto {
  @ApiProperty({ example: '123' })
  runId: string;

  @ApiProperty({
    description: '취소 성공 여부 (이미 실행/종료된 작업이면 false)',
    example: true,
  })
  cancelled: boolean;
}

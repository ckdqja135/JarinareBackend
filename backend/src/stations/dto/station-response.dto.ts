import { ApiProperty } from "@nestjs/swagger";

/**
 * 프론트엔드 StationProps 호환 응답. (nodeid / nodename 만 노출)
 * 내부 동기화 필드(cityCode, isActive, syncedAt)는 노출하지 않는다.
 */
export class StationResponseDto {
  @ApiProperty({ description: "역 ID", example: "NAT010000" })
  nodeid: string;

  @ApiProperty({ description: "역 이름", example: "서울역" })
  nodename: string;
}

/** 관리자 수동 동기화 결과 요약. */
export class StationSyncResultDto {
  @ApiProperty({ description: "실행 여부 (다른 인스턴스가 실행 중이면 false)" })
  executed: boolean;

  @ApiProperty({ description: "성공적으로 동기화된 도시 수" })
  syncedCities: number;

  @ApiProperty({ description: "실패한 도시 수" })
  failedCities: number;

  @ApiProperty({ description: "upsert(생성/갱신)된 역 수" })
  upserted: number;

  @ApiProperty({ description: "비활성화(isActive=false)된 역 수" })
  deactivated: number;
}

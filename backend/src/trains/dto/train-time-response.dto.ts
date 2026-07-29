import { ApiProperty } from '@nestjs/swagger';

/**
 * 프론트엔드 TrainTimeProps 호환 응답.
 * 숫자 필드는 number 로 정규화하고, 날짜(dep/arr plandtime)는 기존 숫자 형식(YYYYMMDDHHmm)을 유지한다.
 */
export class TrainTimeResponseDto {
  @ApiProperty({ description: '성인 요금(원)', example: 23700 })
  adultcharge: number;

  @ApiProperty({ description: '도착역 이름', example: '부산' })
  arrplacename: string;

  @ApiProperty({
    description: '도착 예정시각 (YYYYMMDDHHmm)',
    example: 202607251230,
  })
  arrplandtime: number;

  @ApiProperty({ description: '출발역 이름', example: '서울' })
  depplacename: string;

  @ApiProperty({
    description: '출발 예정시각 (YYYYMMDDHHmm)',
    example: 202607250900,
  })
  depplandtime: number;

  @ApiProperty({ description: '열차 등급명', example: 'KTX' })
  traingradename: string;

  @ApiProperty({ description: '열차 번호', example: 101 })
  trainno: number;
}

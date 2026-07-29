import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class StationQueryDto {
  @ApiPropertyOptional({
    description: '도시 코드로 필터링 (예: 11=서울). 생략 시 전체 역 반환',
    example: '11',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,3}$/, { message: 'cityCode 는 숫자 형식이어야 합니다.' })
  cityCode?: string;
}

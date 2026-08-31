import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** 카카오 인가 코드 교환 요청. */
export class KakaoTokenDto {
  @ApiProperty({ description: '카카오 인가 코드' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '리다이렉트 URI (허용 목록과 대조)' })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}

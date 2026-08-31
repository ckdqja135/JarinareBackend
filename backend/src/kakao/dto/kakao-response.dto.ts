import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** 프론트엔드 호환 카카오 토큰 응답. (Firebase OAuthProvider('oidc.kakao') 흐름 유지용) */
export class KakaoTokenResponseDto {
  @ApiProperty({ description: "카카오 액세스 토큰" })
  access_token: string;

  @ApiProperty({ description: "카카오 OIDC ID 토큰" })
  id_token: string;

  @ApiProperty({ description: "토큰 타입", example: "bearer" })
  token_type: string;

  @ApiPropertyOptional({ description: "액세스 토큰 만료(초)" })
  expires_in?: number;
}

/** 카카오 로그인 응답. */
export class KakaoLoginResponseDto {
  @ApiProperty({ description: "JWT 액세스 토큰" })
  accessToken: string;
}

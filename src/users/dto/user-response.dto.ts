import { ApiProperty } from '@nestjs/swagger';

/** 본인 전체 프로필 응답 (프론트엔드 User 인터페이스 호환). */
export class UserProfileDto {
  @ApiProperty({ description: 'Firebase UID' })
  uid: string;

  @ApiProperty({ description: '표시용 아이디' })
  userId: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '나이(문자열)' })
  age: string;

  @ApiProperty({ description: '성별' })
  gender: string;

  @ApiProperty({ description: '좌석 변경 횟수' })
  changeCount: number;

  @ApiProperty({ description: '보유 포인트' })
  point: number;

  @ApiProperty({ description: '좌석 변경 알림 설정' })
  change: boolean;

  @ApiProperty({ description: '응답 알림 설정' })
  response: boolean;

  @ApiProperty({ description: '권한', enum: ['user', 'admin'] })
  role: string;
}

/** 다른 사용자 조회 시 공개 필드만 노출. */
export class PublicUserDto {
  @ApiProperty({ description: 'Firebase UID' })
  uid: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '표시용 아이디' })
  userId: string;
}

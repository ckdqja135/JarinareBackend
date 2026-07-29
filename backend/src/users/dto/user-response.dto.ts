import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: '사용자 인덱스' })
  idx: number;

  @ApiProperty({ description: '표시용 아이디' })
  userId: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '이메일' })
  email: string | null;

  @ApiProperty({ description: '나이', nullable: true })
  age: number | null;

  @ApiProperty({ description: '성별', enum: ['male', 'female'], nullable: true })
  gender: string | null;

  @ApiProperty({ description: '좌석 변경 횟수' })
  seatChageCount: number;

  @ApiProperty({ description: '보유 포인트' })
  point: number;

  @ApiProperty({ description: '좌석 변경 알림 설정' })
  notifiChange: boolean;

  @ApiProperty({ description: '응답 알림 설정' })
  notifResponse: boolean;

  @ApiProperty({ description: '권한', enum: ['user', 'admin'] })
  role: string;
}

export class PublicUserDto {
  @ApiProperty({ description: '표시용 아이디' })
  userId: string;

  @ApiProperty({ description: '이름' })
  name: string;
}

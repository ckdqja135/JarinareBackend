import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 일반 프로필 수정 요청. point / changeCount / uid / role 은 이 DTO 로 변경할 수 없다.
 * (해당 필드는 whitelist 에 없으므로 forbidNonWhitelisted 로 거부된다.)
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '이름' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '표시용 아이디' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  userId?: string;

  @ApiPropertyOptional({ description: '나이(문자열, 프론트 호환)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  age?: string;

  @ApiPropertyOptional({ description: '성별' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  gender?: string;

  @ApiPropertyOptional({ description: '이메일' })
  @IsOptional()
  @IsEmail()
  @MaxLength(190)
  email?: string;
}

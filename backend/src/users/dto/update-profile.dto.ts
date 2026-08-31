import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

/**
 * 일반 프로필 수정 요청. point / changeCount / uid / role 은 이 DTO 로 변경할 수 없다.
 * (해당 필드는 whitelist 에 없으므로 forbidNonWhitelisted 로 거부된다.)
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "이름" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: "표시용 아이디" })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  userId?: string;

  @ApiPropertyOptional({ description: "나이 (숫자, 예: 20)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @ApiPropertyOptional({ description: "성별", enum: ["male", "female"] })
  @IsOptional()
  @IsIn(["male", "female"])
  gender?: string;

  @ApiPropertyOptional({ description: "이메일" })
  @IsOptional()
  @IsEmail()
  @MaxLength(190)
  email?: string;
}

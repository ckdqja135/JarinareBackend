import { ApiProperty } from "@nestjs/swagger";
import { UserProfileDto } from "../../users/dto/user-response.dto";

export class AuthResponseDto {
  @ApiProperty({ description: "JWT 액세스 토큰 (15분)" })
  accessToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GithubLoginDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  redirectUri?: string;
}

import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { GithubLoginDto } from "./dto/github-login.dto";
import { GithubLoginResponseDto } from "./dto/github-response.dto";
import { GithubService } from "./github.service";

@Controller("oauth/github")
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: GithubLoginDto): Promise<GithubLoginResponseDto> {
    return this.githubService.login(dto);
  }
}

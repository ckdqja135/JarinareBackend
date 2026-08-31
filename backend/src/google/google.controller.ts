import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { GoogleLoginResponseDto } from "./dto/google-response.dto";
import { GoogleService } from "./google.service";

@Controller("oauth/google")
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: GoogleLoginDto): Promise<GoogleLoginResponseDto> {
    return this.googleService.login(dto);
  }
}

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import {
  KakaoLoginResponseDto,
  KakaoTokenResponseDto,
} from './dto/kakao-response.dto';
import { KakaoTokenDto } from './dto/kakao-token.dto';
import { KakaoService } from './kakao.service';

@ApiTags('auth-kakao')
@Controller('auth/kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {}

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '카카오 인가 코드 → 토큰 교환',
    description:
      'client_secret 을 서버에서만 사용해 토큰을 교환한다. 기존 Firebase OAuthProvider 흐름과 호환.',
  })
  @ApiOkResponse({ type: KakaoTokenResponseDto })
  token(@Body() dto: KakaoTokenDto): Promise<KakaoTokenResponseDto> {
    return this.kakaoService.exchangeToken(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '카카오 로그인 (Firebase Custom Token 발급)',
    description:
      'id_token 을 검증한 뒤 Firebase Custom Token 을 발급하고, 사용자 기본 데이터를 보장한다.',
  })
  @ApiOkResponse({ type: KakaoLoginResponseDto })
  login(@Body() dto: KakaoTokenDto): Promise<KakaoLoginResponseDto> {
    return this.kakaoService.login(dto);
  }
}

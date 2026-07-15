import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 헬스체크 성격의 루트 경로는 인증 없이 접근 허용
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { KakaoController } from './kakao.controller';
import { KakaoService } from './kakao.service';

@Module({
  imports: [UsersModule],
  controllers: [KakaoController],
  providers: [KakaoService],
})
export class KakaoModule {}

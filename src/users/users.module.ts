import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // AuthModule 에서 사용자 조회를 위해 UsersService 를 사용한다.
  exports: [UsersService],
})
export class UsersModule {}

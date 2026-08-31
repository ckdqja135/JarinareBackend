import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PublicUserDto, UserProfileDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회 (없으면 기본값으로 생성)' })
  @ApiOkResponse({ type: UserProfileDto })
  getMe(@CurrentUser() user: AuthUser): Promise<UserProfileDto> {
    return this.usersService.getMe(user);
  }

  @Patch('me')
  @ApiOperation({
    summary: '내 프로필 수정',
    description: 'point / changeCount / uid / role 은 수정할 수 없다.',
  })
  @ApiOkResponse({ type: UserProfileDto })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user, dto);
  }

  @Patch('me/notification-settings')
  @ApiOperation({ summary: '내 알림 설정 수정 (change/response)' })
  @ApiOkResponse({ type: UserProfileDto })
  updateNotificationSettings(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateNotificationSettings(user, dto);
  }

  @Get(':uid')
  @ApiOperation({
    summary: '다른 사용자 공개 프로필 조회',
    description: '공개 가능한 필드(uid/name/userId)만 반환한다.',
  })
  @ApiOkResponse({ type: PublicUserDto })
  getPublicProfile(@Param('uid') uid: string): Promise<PublicUserDto> {
    return this.usersService.getPublicProfile(uid);
  }
}

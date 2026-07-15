import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// CreateUserDto 의 모든 필드를 선택적(optional)으로 만들면서 유효성 검사 규칙은 유지한다.
export class UpdateUserDto extends PartialType(CreateUserDto) {}

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/auth-user.interface';

export const ROLES_KEY = 'roles';

/**
 * 라우트에 필요한 권한을 지정한다. RolesGuard 가 request.user.role 과 대조한다.
 * 예) @Roles('admin')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

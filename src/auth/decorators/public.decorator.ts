import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 전역 JWT 가드를 우회(인증 없이 접근 허용)하고 싶은 라우트에 붙인다.
 * 예) 로그인, 헬스체크 등
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

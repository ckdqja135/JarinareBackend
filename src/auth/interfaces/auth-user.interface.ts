/**
 * Firebase ID 토큰 검증 후 request.user 에 주입되는 인증 사용자 정보.
 * uid 는 항상 신뢰된 Firebase Auth UID 이며, 클라이언트가 보낸 body/query 의 uid 는
 * 반드시 이 값과 대조해야 한다.
 */
export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  role: UserRole;
}

export type UserRole = 'user' | 'admin';

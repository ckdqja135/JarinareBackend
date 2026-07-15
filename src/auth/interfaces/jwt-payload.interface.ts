// JWT 토큰에 담기는 페이로드
export interface JwtPayload {
  sub: number; // 사용자 id
  username: string;
}

// 검증 후 request.user 에 주입되는 사용자 정보
export interface AuthUser {
  userId: number;
  username: string;
}

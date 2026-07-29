// @role: features/Auth
// @rule: CLIENT_SECRET을 서버로 이동 - 백엔드 프록시를 통해 카카오 토큰 교환
import { REDIRECT_URI } from '@/shared/Social/KakaoConfig';
import { backendClient } from '@/shared/api/backendClient';

export const KakaoToken = async (code: string) => {
  const { data } = await backendClient.post('/auth/kakao/token', {
    code,
    redirectUri: REDIRECT_URI,
  });
  return data;
};

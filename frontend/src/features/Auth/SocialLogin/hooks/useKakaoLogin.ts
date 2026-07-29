import { KAKAO_AUTH_URL } from '@/shared/Social/KakaoConfig';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const useKakaoLogin = () => {
  const onClick = () => {
    window.location.href = KAKAO_AUTH_URL;
  };
  return { onClick };
};

export const useKakaoRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const KakaoRedirect = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (!code) return;
      try {
        const { data } = await backendClient.post<{ accessToken: string }>(
          '/api/auth/kakao/login',
          { code, redirectUri: window.location.origin + '/auth/kakao/callback' },
        );
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        navigate('/');
      } catch (e) {
        console.error('[Kakao] 로그인 오류:', e);
        navigate('/auth/login');
      }
    };
    KakaoRedirect();
  }, []);
};

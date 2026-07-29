export const REST_API_KEY = import.meta.env.VITE_APP_REST_API_KEY;
export const CLIENT_SECRET = import.meta.env.VITE_APP_CLIENT_SECRET;

export const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

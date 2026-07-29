// @role: shared/api
// @rule: localStorage의 JWT 액세스 토큰을 Authorization 헤더에 자동 첨부, 401 시 쿠키 기반 자동 갱신
import axios from 'axios';

export const ACCESS_TOKEN_KEY = 'access_token';

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

export const backendClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // httpOnly 쿠키(refresh_token) 자동 전송
});

backendClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (token: string | null, err: unknown = null) => {
  failedQueue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(err)));
  failedQueue = [];
};

backendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return backendClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/oauth/refresh`,
        {},
        { withCredentials: true },
      );

      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

      processQueue(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return backendClient(original);
    } catch (refreshError) {
      processQueue(null, refreshError);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.location.href = '/auth/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

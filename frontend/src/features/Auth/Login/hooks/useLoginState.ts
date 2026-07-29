import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useNavigate } from 'react-router-dom';
import { LoadingStore, LoginMessageStore } from '../model/useLoginStore';
import { FieldValues } from 'react-hook-form';

export const useLoginState = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = LoadingStore();
  const { setMessage } = LoginMessageStore();

  const onSubmit = async (data: FieldValues) => {
    try {
      setIsLoading(true);
      const { data: res } = await backendClient.post<{ accessToken: string }>(
        '/oauth/login',
        { email: data.email, password: data.password },
      );
      localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
      navigate('/');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        setMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        console.error('[Login] 오류:', e);
        setMessage('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading };
};

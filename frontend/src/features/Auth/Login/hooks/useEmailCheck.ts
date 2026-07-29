import { useState } from 'react';
import { backendClient } from '@/shared/api/backendClient';
import { EmailErrorStore } from '../model/useLoginStore';

export const useEmailCheck = () => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const { setEmailError } = EmailErrorStore();

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email) return false;

    try {
      setIsChecking(true);
      setEmailError('');

      const { data } = await backendClient.get<{ exists: boolean }>(
        '/api/users/check-email',
        { params: { email } },
      );

      if (!data.exists) {
        setEmailError('등록되지 않은 이메일 입니다.');
        return false;
      }

      return true;
    } catch {
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return { checkEmailExists, isChecking };
};

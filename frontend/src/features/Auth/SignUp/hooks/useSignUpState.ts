// @rule: Firebase Auth 직접 호출 금지 - 백엔드 /oauth/signup 경유
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useNavigate } from 'react-router-dom';
import {
  LoadingStore,
  SelectedAgeStore,
  SelectedGenderStore,
  SignUpMessageStore,
} from '../model/SignUpStore';
import { FieldValues } from 'react-hook-form';

const AGE_MAP: Record<string, number> = {
  '10대': 10, '20대': 20, '30대': 30,
  '40대': 40, '50대': 50, '60대+': 60,
};

const GENDER_MAP: Record<string, string> = {
  '남자': 'male',
  '여자': 'female',
};

export const useSignUpState = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = LoadingStore();
  const { message, setMessage } = SignUpMessageStore();
  const { selectedAge, setSelectedAge } = SelectedAgeStore();
  const { selectedGender, setSelectedGender } = SelectedGenderStore();

  const onSubmit = async (data: FieldValues): Promise<boolean> => {
    try {
      setIsLoading(true);
      setMessage('');

      const { data: res } = await backendClient.post<{ accessToken: string }>(
        '/oauth/signup',
        {
          email: data.email,
          password: data.password,
          name: data.name,
          ...(selectedAge ? { age: AGE_MAP[selectedAge] } : {}),
          ...(selectedGender ? { gender: GENDER_MAP[selectedGender] } : {}),
        },
      );

      localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
      setSelectedGender('');
      setSelectedAge('');
      navigate('/');
      return true;
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 409) {
        setMessage('이미 사용 중인 이메일 입니다.');
      } else {
        console.error('[SignUp] 오류:', e);
        setMessage('회원가입 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading, message, setMessage };
};

import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';
import { EmailErrorStore } from '../model/useLoginStore';
import { useEffect } from 'react';

const EmailForm = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const { emailError, setEmailError } = EmailErrorStore();

  // 이메일 입력 값을 감시
  const emailValue = watch('email');

  // 이메일 입력이 변경되면 중복 체크 에러 메시지 초기화
  useEffect(() => {
    if (emailError) {
      setEmailError('');
    }
  }, [emailValue]);

  return (
    <div className="flex h-full flex-col gap-y-3">
      <AuthContent
        type="email"
        title="로그인"
        subtitle="이메일"
        placeholder="이메일"
        name={register('email')}
      />
      <div className="flex flex-col gap-y-3 text-base font-bold text-red">
        <span className="animate-bounce">
          {/* 이메일 에러 발생 시에만 에러 메세지 생성 */}
          {errors.email == undefined ? null : String(errors.email?.message)}
        </span>
        <span className="animate-bounce">
          {/* 이메일 중복 체크 에러 메세지 생성 */}
          {emailError}
        </span>
      </div>
    </div>
  );
};

export default EmailForm;

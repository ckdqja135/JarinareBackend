import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';
import { LoginMessageStore } from '../model/useLoginStore';
import { useEffect, useState } from 'react';

const PasswordForm = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const { message, setMessage } = LoginMessageStore();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // 비밀번호 입력 값을 감시
  const passwordValue = watch('password');

  // 비밀번호 입력이 변경되면 로그인 에러 메시지 초기화
  useEffect(() => {
    if (message) {
      setMessage('');
    }
  }, [passwordValue]);

  // Caps Lock 상태 감지
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="flex h-full flex-col gap-y-3">
      <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
        <AuthContent
          type="password"
          title="로그인"
          subtitle="비밀번호"
          placeholder="비밀번호"
          name={register('password')}
        />
      </div>
      <div className="flex flex-col gap-y-3 text-base font-bold">
        <span className="animate-bounce text-red">
          {/* 비밀번호 에러 발생 시에만 에러 메세지 생성 */}
          {errors.password == undefined
            ? null
            : String(errors.password?.message)}
        </span>
        <span className="animate-bounce text-red">
          {/* 등록되지 않은 사용자거나 비밀번호 불일치 시 에러 메세지 생성 */}
          {message}
        </span>
        {isCapsLockOn && (
          <span className="animate-bounce text-orange-500">
            ⚠️ Caps Lock이 켜져 있습니다.
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordForm;

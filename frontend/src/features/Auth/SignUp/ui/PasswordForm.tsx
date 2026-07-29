import AuthContent from '@/shared/ui/AuthContent';
import { useFormContext } from 'react-hook-form';
import { SignUpMessageStore } from '../model/SignUpStore';
import { useEffect, useState } from 'react';

const PasswordForm = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const { message, setMessage } = SignUpMessageStore();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const passwordValue = watch('password');

  useEffect(() => {
    if (message) {
      setMessage('');
    }
  }, [passwordValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="flex h-full flex-col">
      <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
        <AuthContent
          type="password"
          subtitle="비밀번호"
          placeholder="비밀번호"
          name={register('password')}
        />
        {errors.password && (
          <span className="mt-1 block animate-bounce text-base font-bold text-red">
            {String(errors.password.message)}
          </span>
        )}
        {isCapsLockOn && (
          <span className="mt-1 block animate-bounce text-base font-bold text-orange-500">
            ⚠️ Caps Lock이 켜져 있습니다.
          </span>
        )}
      </div>

      <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
        <AuthContent
          type="password"
          subtitle="비밀번호 확인"
          placeholder="비밀번호 확인"
          name={register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <span className="mt-1 block animate-bounce text-base font-bold text-red">
            {String(errors.confirmPassword.message)}
          </span>
        )}
        {message && (
          <span className="mt-1 block animate-bounce text-base font-bold text-red">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordForm;

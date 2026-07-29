/**
 * @role: widget
 * @rule: hooks — 상태·사이드이펙트·이벤트 핸들러 담당
 */
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  LoadingStore,
  LoginMessageStore,
} from '@/features/Auth/Login/model/useLoginStore';
export const usePasswordModal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useFormContext();
  const { isLoading } = LoadingStore();
  const { message, setMessage } = LoginMessageStore();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const passwordValue = watch('password');
  useEffect(() => {
    if (message) setMessage('');
  }, [passwordValue]);

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    message,
    isCapsLockOn,
    setIsCapsLockOn,
  };
};

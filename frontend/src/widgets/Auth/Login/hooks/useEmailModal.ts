/**
 * @role: widget
 * @rule: hooks — 상태·사이드이펙트·이벤트 핸들러 담당
 */
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import useModalStore from '@/widgets/model/AuthStore';
import { useEmailCheck } from '@/features/Auth/Login/hooks/useEmailCheck';
import { EmailErrorStore } from '@/features/Auth/Login/model/useLoginStore';
export const useEmailModal = () => {
  const { openModal } = useModalStore();
  const {
    register,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext();
  const { checkEmailExists, isChecking } = useEmailCheck();
  const { emailError, setEmailError } = EmailErrorStore();

  const emailValue = watch('email');
  useEffect(() => {
    if (emailError) setEmailError('');
  }, [emailValue]);

  const handleNextClick = useCallback(async () => {
    const email = getValues('email');
    if (errors.email || email === '') return;
    const isRegistered = await checkEmailExists(email);
    if (isRegistered) {
      setEmailError('');
      openModal('PasswordModal');
    }
  }, [getValues, errors.email, checkEmailExists, setEmailError, openModal]);

  return { register, errors, emailError, isChecking, handleNextClick };
};

/**
 * @role: widget
 * @rule: PC Step 1(이메일) 전용 — 이메일 입력 후 다음 단계로 이동
 */
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import useModalStore from '@/widgets/model/AuthStore';
import { useEmailCheck } from '@/features/Auth/SignUp/hooks/useEmailCheck';
import { EmailErrorStore } from '@/features/Auth/SignUp/model/SignUpStore';

export const usePCEmailStep = () => {
  const { modalType, openModal } = useModalStore();
  const {
    getValues,
    formState: { errors },
  } = useFormContext();
  const { checkEmailExists, isChecking } = useEmailCheck();
  const { setEmailError } = EmailErrorStore();

  const handleNext = useCallback(async () => {
    const email = getValues('email');
    if (errors.email || email === '') return;
    const isAvailable = await checkEmailExists(email);
    if (isAvailable) {
      setEmailError('');
      openModal('NameModal');
    }
  }, [
    modalType,
    getValues,
    errors.email,
    checkEmailExists,
    setEmailError,
    openModal,
  ]);

  return { handleNext, isChecking };
};

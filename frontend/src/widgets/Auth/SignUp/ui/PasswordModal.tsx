/**
 * @role: widget
 * @rule: 모바일 전용 — PC 레이아웃은 SignUpPage pcModalContent에서 처리
 */
import PasswordForm from '@/features/Auth/SignUp/ui/PasswordForm';
import SignUpButton from './SignUpButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';
import { useSignUpState } from '@/features/Auth/SignUp/hooks/useSignUpState';
const PasswordModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { handleSubmit } = useFormContext();
  const { onSubmit, message } = useSignUpState();
  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const success = await onSubmit(data);
        if (success) {
          closeModal('EmailModal');
          closeModal('NameModal');
          closeModal('AgeModal');
          closeModal('PasswordModal');
        }
      })}
      className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]"
    >
      <BackWardModalButton
        closeModal={() => closeModal('PasswordModal')}
        openModal={() => openModal('AgeModal')}
        title="회원가입"
        step="Step 4 of 4"
      />
      <PasswordForm />
      {message && (
        <p className="w-full text-center text-sm text-red">{message}</p>
      )}
      <SignUpStageLine stage={4} />
      <SignUpButton text="회원가입" bgColor="blue" textColor="white" />
    </form>
  );
};

export default PasswordModal;

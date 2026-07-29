/**
 * @role: widget
 * @rule: 모바일 전용 — PC 레이아웃은 SignUpPage pcModalContent에서 처리
 */
import NextButton from './NextButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';
import SelectAge from '@/features/Auth/SignUp/ui/SelectAge';
const AgeModal = () => {
  const { closeModal, openModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton
        openModal={() => openModal('NameModal')}
        closeModal={() => closeModal('AgeModal')}
        title="회원가입"
        step="Step 3 of 4"
      />
      <SelectAge />
      <SignUpStageLine stage={3} />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={
          errors.name || getValues('name') == '' ? 'AgeModal' : 'PasswordModal'
        }
      />
    </div>
  );
};

export default AgeModal;

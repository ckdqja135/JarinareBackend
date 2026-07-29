/**
 * @role: widget
 * @rule: 모바일 전용 — PC 레이아웃은 SignUpPage pcModalContent에서 처리
 */
import NameForm from '@/features/Auth/SignUp/ui/NameForm';
import NextButton from './NextButton';
import useModalStore from '@/widgets/model/AuthStore';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import SignUpStageLine from './SignUpStageLine';
import { useFormContext } from 'react-hook-form';
const NameModal = () => {
  const { closeModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();
  return (
    <div className="flex h-full w-full flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
      <BackWardModalButton
        closeModal={() => closeModal('NameModal')}
        title="회원가입"
        step="Step 2 of 4"
      />
      <NameForm />
      <SignUpStageLine stage={2} />
      <NextButton
        text="다음"
        bgColor="blue"
        textColor="white"
        modalTypes={
          errors.name || getValues('name') == '' ? 'NameModal' : 'AgeModal'
        }
      />
    </div>
  );
};

export default NameModal;

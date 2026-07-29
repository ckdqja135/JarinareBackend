/**
 * @role: widget
 * @rule: PC Step 3(나이대/성별) — FormProvider 내부에서만 사용
 */
import { useFormContext } from 'react-hook-form';
import useModalStore from '@/widgets/model/AuthStore';
import SelectAge from '@/features/Auth/SignUp/ui/SelectAge';
import SignUpStageLine from './SignUpStageLine';

const BackIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PCAgeStep = () => {
  const { openModal } = useModalStore();
  const {
    formState: { errors },
    getValues,
  } = useFormContext();

  return (
    <div className="flex h-full w-full flex-col justify-between px-10 pb-10">
      <div>
        <div className="mt-8 flex w-full items-center">
          <button
            type="button"
            onClick={() => openModal('NameModal')}
            className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
          >
            <BackIcon />
            회원가입
          </button>
          <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
            Step 3 of 4
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">추가 정보</h2>
          <p className="text-sm text-gray-400">맞춤 서비스를 위한 정보예요</p>
        </div>
        <div className="mt-8">
          <SelectAge />
        </div>
      </div>
      <div>
        <SignUpStageLine stage={3} />
        <button
          type="button"
          onClick={() => {
            if (!errors.name && getValues('name') !== '')
              openModal('PasswordModal');
          }}
          className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default PCAgeStep;

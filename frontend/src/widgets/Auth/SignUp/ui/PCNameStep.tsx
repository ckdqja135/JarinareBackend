/**
 * @role: widget
 * @rule: PC Step 2(이름) — FormProvider 내부에서만 사용
 */
import { useFormContext } from 'react-hook-form';
import useModalStore from '@/widgets/model/AuthStore';
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

const PCNameStep = () => {
  const { openModal, resetModal } = useModalStore();
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();

  return (
    <div className="flex h-full w-full flex-col justify-between px-10 pb-10">
      <div>
        <div className="mt-8 flex w-full items-center">
          <button
            type="button"
            onClick={() => resetModal()}
            className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
          >
            <BackIcon />
            회원가입
          </button>
          <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
            Step 2 of 4
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">이름</h2>
          <p className="text-sm text-gray-400">실명을 입력해주세요</p>
        </div>
        <div className="mt-8 flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">이름</span>
          <input
            {...register('name')}
            type="text"
            placeholder="이름을 입력하세요"
            autoComplete="off"
            className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
          />
          {errors.name && (
            <span className="text-xs text-red">
              {String(errors.name.message)}
            </span>
          )}
        </div>
      </div>
      <div>
        <SignUpStageLine stage={2} />
        <button
          type="button"
          onClick={() => {
            if (!errors.name && getValues('name') !== '') openModal('AgeModal');
          }}
          className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default PCNameStep;

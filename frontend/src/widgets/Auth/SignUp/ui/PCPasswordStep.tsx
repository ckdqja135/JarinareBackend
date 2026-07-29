/**
 * @role: widget
 * @rule: PC Step 4(비밀번호) — FormProvider 내부에서만 사용
 */
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useModalStore from '@/widgets/model/AuthStore';
import { useSignUpState } from '@/features/Auth/SignUp/hooks/useSignUpState';
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

const PCPasswordStep = () => {
  const { openModal, resetModal } = useModalStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext();
  const { onSubmit, isLoading, message } = useSignUpState();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const success = await onSubmit(data);
        if (success) resetModal();
      })}
      className="flex h-full w-full flex-col justify-between px-10 pb-10"
    >
      <div>
        <div className="mt-8 flex w-full items-center">
          <button
            type="button"
            onClick={() => openModal('AgeModal')}
            className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
          >
            <BackIcon />
            회원가입
          </button>
          <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
            Step 4 of 4
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">비밀번호</h2>
          <p className="text-sm text-gray-400">
            안전한 비밀번호를 설정해주세요
          </p>
        </div>
        <div
          className="mt-8 flex flex-col gap-4"
          onKeyDown={(e) => setIsCapsLockOn(e.getModifierState('CapsLock'))}
          onKeyUp={(e) => setIsCapsLockOn(e.getModifierState('CapsLock'))}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">
              비밀번호
            </span>
            <input
              {...register('password')}
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="off"
              className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
            />
            {errors.password && (
              <span className="text-xs text-red">
                {String(errors.password.message)}
              </span>
            )}
            {isCapsLockOn && (
              <span className="text-xs text-orange-500">
                ⚠️ Caps Lock이 켜져 있습니다.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">
              비밀번호 확인
            </span>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="off"
              className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red">
                {String(errors.confirmPassword.message)}
              </span>
            )}
            <span className="text-xs text-gray-400">
              영문 · 숫자 · 특수문자 포함 8자 이상
            </span>
          </div>
        </div>
      </div>
      <div>
        {message && (
          <p className="text-center text-sm text-red">{message}</p>
        )}
        <SignUpStageLine stage={4} />
        <button
          type="submit"
          disabled={isLoading}
          className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:opacity-60"
        >
          {isLoading ? '회원가입 중...' : '회원가입 완료'}
        </button>
      </div>
    </form>
  );
};

export default PCPasswordStep;

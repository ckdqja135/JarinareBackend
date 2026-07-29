/**
 * @role: widget
 * @rule: ui only — no business logic
 */
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';
import { useEffect } from 'react';
import { useEmailModal } from '../hooks/useEmailModal';

const EmailModal = () => {
  const { closeModal } = useModalStore();
  const { register, errors, emailError, isChecking, handleNextClick } =
    useEmailModal();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isChecking) handleNextClick();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChecking, handleNextClick]);

  return (
    <div className="flex h-full w-full flex-col justify-between px-10 pb-10">
      <div>
        <div className="mt-8 flex w-full items-center">
          <button
            type="button"
            onClick={() => closeModal('EmailModal')}
            className="flex items-center gap-1 text-sm font-medium text-black hover:text-gray-600"
          >
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
            로그인
          </button>
          <span className="ml-auto rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
            Step 1 of 2
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">이메일</h2>
          <p className="text-sm text-gray-400">
            로그인에 사용할 이메일을 입력해주세요
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">이메일</span>
          <input
            {...register('email')}
            type="email"
            placeholder="이메일을 입력하세요"
            autoComplete="off"
            className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-800 focus:border-blue focus:outline-none"
          />
          {errors.email && (
            <span className="text-xs text-red">
              {String(errors.email.message)}
            </span>
          )}
          {emailError && <span className="text-xs text-red">{emailError}</span>}
        </div>
      </div>

      <div>
        <LoginStageLine stage={1} width={150} borderRadius="xl" />
        <button
          type="button"
          onClick={handleNextClick}
          disabled={isChecking}
          className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50"
        >
          {isChecking ? '확인 중...' : '다음'}
        </button>
      </div>
    </div>
  );
};

export default EmailModal;

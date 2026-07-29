/**
 * @role: widget
 * @rule: ui only — no business logic
 */
import useModalStore from '@/widgets/model/AuthStore';
import LoginStageLine from './LoginStageLine';
import { useLoginState } from '@/features/Auth/Login/hooks/useLoginState';
import { usePasswordModal } from '../hooks/usePasswordModal';

const PasswordModal = () => {
  const { openModal } = useModalStore();
  const { onSubmit } = useLoginState();
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    message,
    isCapsLockOn,
    setIsCapsLockOn,
  } = usePasswordModal();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full w-full flex-col justify-between px-10 pb-10"
    >
      <div>
        <div className="mt-8 flex w-full items-center">
          <button
            type="button"
            onClick={() => openModal('EmailModal')}
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
            Step 2 of 2
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900">비밀번호</h2>
          <p className="text-sm text-gray-400">
            로그인에 사용할 비밀번호를 입력해주세요
          </p>
        </div>

        <div
          className="mt-8 flex flex-col gap-1.5"
          onKeyDown={(e) => setIsCapsLockOn(e.getModifierState('CapsLock'))}
          onKeyUp={(e) => setIsCapsLockOn(e.getModifierState('CapsLock'))}
        >
          <span className="text-sm font-semibold text-gray-700">비밀번호</span>
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
          {message && <span className="text-xs text-red">{message}</span>}
          {isCapsLockOn && (
            <span className="text-xs text-orange-500">
              ⚠️ Caps Lock이 켜져 있습니다.
            </span>
          )}
        </div>
      </div>

      <div>
        <LoginStageLine stage={2} width={300} borderRadius="xl" />
        <button
          type="submit"
          disabled={isLoading}
          className="relative flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </form>
  );
};

export default PasswordModal;

/**
 * @role: shared/ui
 * @rule: 렌더링만 담당, 비로그인 안내 공통 블록
 */

interface Props {
  description?: string;
  onLogin: () => void;
  size?: 'sm' | 'md' | 'lg';
  horizontal?: boolean;
}

const SIZE = {
  sm: {
    icon: 20,
    title: 'text-xs font-bold',
    desc: 'text-[10px]',
    btn: 'rounded-md px-5 py-1.5 text-xs',
  },
  md: {
    icon: 40,
    title: 'text-base font-bold',
    desc: 'text-sm',
    btn: 'rounded-lg px-8 py-2.5 text-sm',
  },
  lg: {
    icon: 48,
    title: 'text-lg font-bold',
    desc: 'text-sm',
    btn: 'rounded-lg px-10 py-3 text-sm mt-2',
  },
} as const;

const LoginRequiredBlock = ({
  description,
  onLogin,
  size = 'lg',
  horizontal = false,
}: Props) => {
  const s = SIZE[size];
  if (horizontal) {
    return (
      <div className="flex items-center gap-4">
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div className="flex flex-col gap-0.5">
          <p className={`text-gray-800 ${s.title}`}>
            로그인이 필요한 서비스입니다
          </p>
          {description && (
            <p className={`text-gray-400 ${s.desc}`}>{description}</p>
          )}
        </div>
        <button
          onClick={onLogin}
          className={`shrink-0 bg-blue font-bold text-white hover:bg-blue/90 ${s.btn}`}
        >
          로그인하기
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p className={`text-gray-800 ${s.title}`}>로그인이 필요한 서비스입니다</p>
      {description && (
        <p className={`text-gray-400 ${s.desc}`}>{description}</p>
      )}
      <button
        onClick={onLogin}
        className={`bg-blue font-bold text-white hover:bg-blue/90 ${s.btn}`}
      >
        로그인하기
      </button>
    </div>
  );
};

export default LoginRequiredBlock;

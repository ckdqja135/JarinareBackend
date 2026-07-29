import github from '@/assets/social/github.png';
import { useGithubLogin } from '../hooks/useGithubLogin';

const GithubLogin = () => {
  const { onClick } = useGithubLogin();
  return (
    <button
      onClick={onClick}
      className="relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-white text-base font-bold text-black shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50 lg:w-full"
    >
      <img className="absolute left-5" width={20} height={20} src={github} />
      깃허브 로그인
    </button>
  );
};

export default GithubLogin;

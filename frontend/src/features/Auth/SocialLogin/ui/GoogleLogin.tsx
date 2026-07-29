import google from '@/assets/social/google.png';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

const GoogleLogin = () => {
  const { onClick } = useGoogleLogin();
  return (
    <button
      onClick={onClick}
      className="relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-white text-base font-bold text-black shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50 lg:w-full"
    >
      <img
        className="absolute left-[20px]"
        width={20}
        height={20}
        src={google}
      />
      구글 로그인
    </button>
  );
};

export default GoogleLogin;

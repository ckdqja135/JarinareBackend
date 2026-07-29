import GithubLogin from '@/features/Auth/SocialLogin/ui/GithubLogin';
import GoogleLogin from '@/features/Auth/SocialLogin/ui/GoogleLogin';
import KakaoLogin from '@/features/Auth/SocialLogin/ui/KakakoLogin';

const SocialLoginList = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <KakaoLogin />
      <GithubLogin />
      <GoogleLogin />
    </div>
  );
};

export default SocialLoginList;

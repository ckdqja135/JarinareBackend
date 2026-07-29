import loading from '@/assets/icons/loading.png';
import { useKakaoRedirect } from '../hooks/useKakaoLogin';

// 카카오 API 요청시 로딩창 생성
const KakaoRedirect = () => {
  useKakaoRedirect();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <img src={loading} className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default KakaoRedirect;

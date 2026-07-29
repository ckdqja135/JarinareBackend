import { useEffect, useState } from 'react';
import Router from './routes';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import Intro from '@/widgets/Intro/ui/Intro';
import { useIsIntro } from '@/features/Intro/hooks/useIsIntro';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

function App() {
  const isTicketView = window.location.pathname === '/ticket/view';
  const [isLoading, setLoading] = useState(!isTicketView);
  const { isIntro } = useIsIntro();

  useEffect(() => {
    if (!isTicketView) {
      // JWT 존재 여부만 확인 후 로딩 완료
      localStorage.getItem(ACCESS_TOKEN_KEY);
      setLoading(false);
    }
  }, []);

  if (isTicketView) return <Router />;
  return isIntro ? <Intro /> : isLoading ? <LoadingScreen /> : <Router />;
}

export default App;

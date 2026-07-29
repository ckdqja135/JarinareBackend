import { useLocation } from 'react-router-dom';

export const useHideRoute = () => {
  const location = useLocation();
  const Routes = ['/auth/login', '/auth/signup', '/oauth/kakao/callback'];

  const hideRoute = Routes.includes(location.pathname);
  return { hideRoute };
};

import { useLocation } from 'react-router-dom';

export const useSeatLocation = () => {
  const location = useLocation();
  return { location };
};

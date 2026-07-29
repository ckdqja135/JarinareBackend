import { useLocation } from 'react-router-dom';

export const useTicketLocation = () => {
  const location = useLocation();
  return { location };
};

import { useNavigate } from 'react-router-dom';

export const useNaviation = () => {
  const navigate = useNavigate();
  return { navigate };
};

import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigation = useNavigate();
  return { navigation };
};

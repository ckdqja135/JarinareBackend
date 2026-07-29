import { useNavigate } from 'react-router-dom';

export const useBackButton = () => {
  const naviate = useNavigate();
  const onClick = () => {
    naviate(-1);
  };
  return { onClick };
};

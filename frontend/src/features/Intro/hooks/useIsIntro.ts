import { useEffect, useState } from 'react';
import intro from '@/assets/logo/intro.png';

export const useIsIntro = () => {
  const [isIntro, setIsIntro] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('intro');
    if (!seen) {
      setIsIntro(true);
      localStorage.setItem('intro', intro);
      setTimeout(() => setIsIntro(false), 3000);
    }
  }, []);
  return { isIntro };
};

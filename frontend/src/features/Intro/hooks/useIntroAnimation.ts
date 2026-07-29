import { useEffect, useState } from 'react';

export const useIntroAnimation = () => {
  const [isHide, setIsHide] = useState(false);
  const [isFade, setIsFade] = useState(false);

  let fadeTimer: NodeJS.Timeout;
  let hideTimer: NodeJS.Timeout;

  useEffect(() => {
    setIsHide(true);
    setIsFade(true);

    fadeTimer = setTimeout(() => setIsFade(false), 2200);
    hideTimer = setTimeout(() => setIsHide(false), 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(fadeTimer);
    };
  }, []);
  return { isHide, isFade, setIsHide };
};

import { useEffect, useState } from 'react';

export const useHideNotification = () => {
  const [isHover, setIsHover] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [isFade, setIsFade] = useState(false);

  let fadeTimer: NodeJS.Timeout;
  let hideTimer: NodeJS.Timeout;

  useEffect(() => {
    setIsHide(true);
    setIsFade(true);

    if (!isHover) {
      fadeTimer = setTimeout(() => setIsFade(false), 4200);
      hideTimer = setTimeout(() => setIsHide(false), 5000);
    } else {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(fadeTimer);
    };
  }, [isHover]);
  return { isHide, isFade, isHover, setIsHover, setIsHide };
};

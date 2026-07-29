/**
 * @role: widgets — 스와이프 삭제 제스처 훅
 * @rule: 터치/마우스 스와이프 상태만 관리, UI 렌더링 포함 금지
 */
import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 70;

export const useSwipeToDelete = () => {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const handleStart = (clientX: number) => {
    startX.current = clientX;
    dragging.current = true;
  };

  const handleMove = (clientX: number) => {
    if (!dragging.current) return;
    const dx = startX.current - clientX;
    if (dx > 0) setOffsetX(Math.min(dx, SWIPE_THRESHOLD));
    else setOffsetX(0);
  };

  const handleEnd = () => {
    dragging.current = false;
    setOffsetX((prev) => (prev >= SWIPE_THRESHOLD / 2 ? SWIPE_THRESHOLD : 0));
  };

  return {
    offsetX,
    dragging,
    handleStart,
    handleMove,
    handleEnd,
    SWIPE_THRESHOLD,
  };
};

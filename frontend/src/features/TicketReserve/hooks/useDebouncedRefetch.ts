import { useEffect, useRef } from 'react';

// 디바운싱을 적용한 refetch 훅 (중복 호출 방지)
// delay: 디바운싱 지연 시간
export const useDebouncedRefetch = (
  refetch: () => void,
  delay: number = 800,
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRefetchingRef = useRef<boolean>(false);

  const debouncedRefetch = () => {
    // 이미 refetch 중이면 무시
    if (isRefetchingRef.current) {
      return;
    }

    // 이전 타이머가 있다면 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새로운 타이머 설정
    timeoutRef.current = setTimeout(async () => {
      try {
        isRefetchingRef.current = true;
        await refetch();
      } finally {
        isRefetchingRef.current = false;
      }
    }, delay);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isRefetchingRef.current = false;
    };
  }, []);

  return debouncedRefetch;
};

/**
 * @role: features — 게시물 조회수 증가·조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { useEffect, useRef, useState } from 'react';
import { incrementViewCountApi, getViewCountApi } from '../api/viewCountApi';

export const useViewCount = (boardType: string, postId: string) => {
  const [viewCount, setViewCount] = useState(0);
  const incremented = useRef(false);

  useEffect(() => {
    if (!boardType || !postId) return;

    if (!incremented.current) {
      incremented.current = true;
      incrementViewCountApi(boardType, postId)
        .then(({ count }) => setViewCount(count))
        .catch(() => {
          // 미인증 사용자는 조회수 증가 불가 - 조회만 수행
          getViewCountApi(boardType, postId).then(({ count }) =>
            setViewCount(count),
          );
        });
    }
  }, [boardType, postId]);

  return { viewCount };
};

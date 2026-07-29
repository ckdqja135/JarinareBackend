/**
 * @role: features — 이벤트 게시글 목록 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { useEffect, useState } from 'react';
import { getEventPostsApi } from '../api/getEventApi';

export const useGetDvent = () => {
  const [eventDat, setEventData] = useState<BoardPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getEventPostsApi()
      .then(({ data: datas }) => {
        setEventData(
          datas
            .filter((d) => d.title)
            .sort((a, b) => a.createdAt - b.createdAt),
        );
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  return { eventDat, isLoaded };
};

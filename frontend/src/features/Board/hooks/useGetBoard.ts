/**
 * @role: features — 자유게시판 게시글 목록 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { useEffect, useState } from 'react';
import { getBoardPostsApi } from '../api/getBoardApi';

export const useGetBoard = () => {
  const [boardData, setBoardData] = useState<BoardPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getBoardPostsApi()
      .then(({ data: datas }) => {
        setBoardData(
          datas
            .filter((d) => d.title)
            .sort((a, b) => a.createdAt - b.createdAt),
        );
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  return { boardData, isLoaded };
};

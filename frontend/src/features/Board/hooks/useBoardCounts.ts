/**
 * @role: features — 게시판 카테고리별 게시물 수 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { useEffect, useState } from 'react';
import { getBoardCountsApi } from '../api/boardCountsApi';
import { BoardCounts } from '../types/boardType';

export const useBoardCounts = () => {
  const [counts, setCounts] = useState<BoardCounts>({
    notice: 0,
    event: 0,
    board: 0,
  });

  useEffect(() => {
    getBoardCountsApi().then(setCounts);
  }, []);

  return { counts };
};

/**
 * @role: features — 게시판 카테고리별 최신 게시물 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { useEffect, useState } from 'react';
import { fetchLatestPostsApi } from '../api/latestPostsApi';
import { LatestPosts } from '../types/boardType';

export const useLatestPosts = () => {
  const [latest, setLatest] = useState<LatestPosts>({
    notice: null,
    event: null,
    board: null,
    board2: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [[notice], [event], [board, board2]] = await Promise.all([
        fetchLatestPostsApi('notice', 1),
        fetchLatestPostsApi('event', 1),
        fetchLatestPostsApi('board', 2),
      ]);
      setLatest({ notice, event, board, board2 });
      setIsLoading(false);
    };
    load();
  }, []);

  return { latest, isLoading };
};

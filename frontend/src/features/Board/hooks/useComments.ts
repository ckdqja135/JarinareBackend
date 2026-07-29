/**
 * @role: features — 게시물 댓글 목록 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { Comment } from '@/entities/Board/types/commentType';
import { useCallback, useEffect, useState } from 'react';
import { getCommentsApi } from '../api/commentsApi';

export const useComments = (boardType: string, postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!boardType || !postId) return;
    const items = await getCommentsApi(boardType, postId);
    setComments(items);
    setIsLoaded(true);
  }, [boardType, postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { comments, isLoaded, refresh };
};

/**
 * @role: features — 게시물 목록 조회수 훅
 * @rule: 목록 조회 시 조회수는 post.views 에서 읽음
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { useMemo } from 'react';

export const useViewCounts = (items: BoardPost[]) => {
  const viewsMap = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.id] = item.views;
    });
    return map;
  }, [items]);

  return { viewsMap };
};

/**
 * @role: features/api — 게시물 목록 조회수 (post.views 에서 읽음)
 * @rule: 목록 조회 시 조회수는 이미 게시글 데이터에 포함됨
 */
import { BoardPost } from '@/entities/Board/types/boardType';

export const getViewCountsFromPosts = (
  items: BoardPost[],
): Record<string, number> => {
  const map: Record<string, number> = {};
  items.forEach((item) => {
    map[item.id] = item.views;
  });
  return map;
};

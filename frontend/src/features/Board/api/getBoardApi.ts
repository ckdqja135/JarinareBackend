/**
 * @role: features/api — 자유게시판 게시글 목록 조회
 * @rule: 백엔드 /api/boards/board/posts 에서 조회
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { backendClient } from '@/shared/api/backendClient';

export const getBoardPostsApi = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  tag?: string;
}): Promise<{ data: BoardPost[]; total: number }> => {
  const { data } = await backendClient.get('/api/boards/board/posts', {
    params: { size: 100, ...params },
  });
  return data;
};

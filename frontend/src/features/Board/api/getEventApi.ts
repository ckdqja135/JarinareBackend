/**
 * @role: features/api — 이벤트 게시글 목록 조회
 * @rule: 백엔드 /api/boards/event/posts 에서 조회
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { backendClient } from '@/shared/api/backendClient';

export const getEventPostsApi = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
}): Promise<{ data: BoardPost[]; total: number }> => {
  const { data } = await backendClient.get('/api/boards/event/posts', {
    params: { size: 100, ...params },
  });
  return data;
};

/**
 * @role: features/api — 게시물 댓글 목록 조회
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId/comments 에서 조회
 */
import { Comment } from '@/entities/Board/types/commentType';
import { backendClient } from '@/shared/api/backendClient';

export const getCommentsApi = async (
  boardType: string,
  postId: string,
): Promise<Comment[]> => {
  const { data } = await backendClient.get(
    `/api/boards/${boardType}/posts/${postId}/comments`,
  );
  return data;
};

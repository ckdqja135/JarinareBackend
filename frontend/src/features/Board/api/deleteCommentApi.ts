/**
 * @role: features/api — 댓글·대댓글 삭제
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId/comments/:commentId 에 DELETE (대댓글은 서버에서 처리)
 */
import { backendClient } from '@/shared/api/backendClient';

export const deleteCommentApi = async (
  boardType: string,
  postId: string,
  commentId: string,
): Promise<void> => {
  await backendClient.delete(
    `/api/boards/${boardType}/posts/${postId}/comments/${commentId}`,
  );
};

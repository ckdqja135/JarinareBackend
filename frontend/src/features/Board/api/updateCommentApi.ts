/**
 * @role: features/api — 댓글 수정
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId/comments/:commentId 에 PATCH
 */
import { backendClient } from '@/shared/api/backendClient';

export const updateCommentApi = async (
  boardType: string,
  postId: string,
  commentId: string,
  content: string,
): Promise<void> => {
  await backendClient.patch(
    `/api/boards/${boardType}/posts/${postId}/comments/${commentId}`,
    { content: content.trim() },
  );
};

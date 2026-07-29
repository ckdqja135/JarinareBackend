/**
 * @role: features/api — 댓글 생성
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId/comments 에 POST (uid·author는 토큰에서 추출)
 */
import { backendClient } from '@/shared/api/backendClient';

export const createCommentApi = async (
  boardType: string,
  postId: string,
  content: string,
  parentId: string | null = null,
): Promise<void> => {
  await backendClient.post(
    `/api/boards/${boardType}/posts/${postId}/comments`,
    { content: content.trim(), parentId },
  );
};

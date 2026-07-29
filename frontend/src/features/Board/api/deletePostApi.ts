/**
 * @role: features/api — 게시물 삭제 (board·notice·event 통합)
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId 에 DELETE
 */
import { backendClient } from '@/shared/api/backendClient';

export const deletePostApi = async (
  boardType: string,
  postId: string,
): Promise<void> => {
  await backendClient.delete(`/api/boards/${boardType}/posts/${postId}`);
};

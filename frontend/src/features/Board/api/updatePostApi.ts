/**
 * @role: features/api — 게시물 수정
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId 에 PATCH
 */
import { backendClient } from '@/shared/api/backendClient';

export const updatePostApi = async (
  boardType: string,
  postId: string,
  data: { title: string; content: string; tags?: string[]; imageUrl?: string },
): Promise<void> => {
  await backendClient.patch(`/api/boards/${boardType}/posts/${postId}`, data);
};

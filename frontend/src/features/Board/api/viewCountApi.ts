/**
 * @role: features/api — 게시물 조회수 증가·조회
 * @rule: 백엔드 /api/boards/:boardType/posts/:postId/views 에서 조회·증가
 */
import { backendClient } from '@/shared/api/backendClient';

export const incrementViewCountApi = async (
  boardType: string,
  postId: string,
): Promise<{ count: number }> => {
  const { data } = await backendClient.post(
    `/api/boards/${boardType}/posts/${postId}/views`,
  );
  return data;
};

export const getViewCountApi = async (
  boardType: string,
  postId: string,
): Promise<{ count: number }> => {
  const { data } = await backendClient.get(
    `/api/boards/${boardType}/posts/${postId}/views`,
  );
  return data;
};

/**
 * @role: features/api — 이벤트 좋아요 조회·토글
 * @rule: 백엔드 /api/boards/event/posts/:postId/like 에서 조회·추가·취소
 */
import { backendClient } from '@/shared/api/backendClient';

export const getEventLikeStatusApi = async (
  postId: string,
): Promise<{ liked: boolean; count: number }> => {
  const { data } = await backendClient.get(
    `/api/boards/event/posts/${postId}/like`,
  );
  return data;
};

export const toggleEventLikeApi = async (
  postId: string,
  isCurrentlyLiked: boolean,
): Promise<{ liked: boolean; count: number }> => {
  if (isCurrentlyLiked) {
    const { data } = await backendClient.delete(
      `/api/boards/event/posts/${postId}/like`,
    );
    return data;
  } else {
    const { data } = await backendClient.put(
      `/api/boards/event/posts/${postId}/like`,
    );
    return data;
  }
};

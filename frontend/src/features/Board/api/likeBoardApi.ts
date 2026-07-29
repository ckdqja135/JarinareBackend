/**
 * @role: features/api — 자유게시판 좋아요 조회·토글
 * @rule: 백엔드 /api/boards/board/posts/:postId/like 에서 조회·추가·취소
 */
import { backendClient } from '@/shared/api/backendClient';

export const getBoardLikeStatusApi = async (
  postId: string,
): Promise<{ liked: boolean; count: number }> => {
  const { data } = await backendClient.get(
    `/api/boards/board/posts/${postId}/like`,
  );
  return data;
};

export const toggleBoardLikeApi = async (
  postId: string,
  isCurrentlyLiked: boolean,
): Promise<{ liked: boolean; count: number }> => {
  if (isCurrentlyLiked) {
    const { data } = await backendClient.delete(
      `/api/boards/board/posts/${postId}/like`,
    );
    return data;
  } else {
    const { data } = await backendClient.put(
      `/api/boards/board/posts/${postId}/like`,
    );
    return data;
  }
};

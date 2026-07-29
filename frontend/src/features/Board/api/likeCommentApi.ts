/**
 * @role: features/api — 댓글 좋아요 조회·토글
 * @rule: 외부 데이터 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const fetchCommentLikedStateApi = async (
  _uid: string,
): Promise<Record<string, boolean>> => {
  const res = await backendClient.get<Record<string, boolean>>(
    '/api/boards/comments/my-likes',
  );
  return res.data;
};

export const subscribeCommentLikeCountApi = (
  commentId: string,
  onCount: (count: number) => void,
): (() => void) => {
  let cancelled = false;

  const poll = async () => {
    try {
      const res = await backendClient.get<{ liked: boolean; count: number }>(
        `/api/boards/_/posts/_/comments/${commentId}/like`,
      );
      if (!cancelled) onCount(res.data.count);
    } catch {
      // 조회 실패 시 기존 값 유지
    }
  };

  poll();
  return () => {
    cancelled = true;
  };
};

export const toggleCommentLikeApi = async (
  _uid: string,
  commentId: string,
  isCurrentlyLiked: boolean,
): Promise<void> => {
  if (isCurrentlyLiked) {
    await backendClient.delete(
      `/api/boards/_/posts/_/comments/${commentId}/like`,
    );
  } else {
    await backendClient.put(
      `/api/boards/_/posts/_/comments/${commentId}/like`,
    );
  }
};

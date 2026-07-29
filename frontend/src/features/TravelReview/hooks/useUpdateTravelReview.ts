/**
 * @role: features — 여행지 후기 수정
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { backendClient } from '@/shared/api/backendClient';

export const useUpdateTravelReview = (_destination: string) => {
  const updateReview = async (
    reviewId: string,
    title: string,
    content: string,
    rating: number,
  ) => {
    await backendClient.patch(`/api/travel-reviews/${reviewId}`, {
      title,
      content,
      rating,
    });
  };

  return { updateReview };
};

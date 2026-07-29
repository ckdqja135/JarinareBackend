/**
 * @role: features — 여행지 후기 삭제
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { backendClient } from '@/shared/api/backendClient';

export const useDeleteTravelReview = (_destination: string) => {
  const deleteReview = async (reviewId: string) => {
    await backendClient.delete(`/api/travel-reviews/${reviewId}`);
  };

  return { deleteReview };
};

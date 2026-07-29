/**
 * @role: features — 여행지 후기 목록 조회
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 * NOTE: 백엔드 TravelReview에 station 필드 없어 destination을 keyword로 검색
 */
import { TravelReview } from '@/entities/TravelReview/types/travelReviewType';
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useState } from 'react';

type ReviewListResponse = {
  data: TravelReview[];
  total: number;
  page: number;
  size: number;
};

export const useGetTravelReviews = (destination: string) => {
  const [reviews, setReviews] = useState<TravelReview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!destination) return;

    backendClient
      .get<ReviewListResponse>('/api/travel-reviews', {
        params: { keyword: destination, sort: 'latest', size: 100 },
      })
      .then(({ data }) => {
        setReviews(data.data);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, [destination]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, isLoaded, averageRating };
};

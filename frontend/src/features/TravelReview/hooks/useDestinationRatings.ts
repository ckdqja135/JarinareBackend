/**
 * @role: features — 전체 역의 평균 별점 조회 (Ticker 정렬용)
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 * NOTE: 백엔드 TravelReview에 station 필드가 없어 역별 집계 불가
 *       백엔드에 station 필드 및 집계 API 추가 시 교체 필요
 */
import { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';
import { useState } from 'react';

export const useDestinationRatings = () => {
  const [summaries] = useState<DestinationReviewSummary[]>([]);
  const [isLoaded] = useState(true);

  return { summaries, isLoaded };
};

/**
 * @role: features — 역 이름 기준 여행지 후기 검색
 * @rule: 상태·계산만 담당, 렌더링 금지
 */
import { useMemo } from 'react';
import type { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';

export const useSearchByStation = (
  query: string,
  summaries: DestinationReviewSummary[],
) => {
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return summaries.filter((s) => s.reviewCount > 0);
    return summaries.filter((s) => s.reviewCount > 0 && s.city.includes(q));
  }, [query, summaries]);

  return { results };
};

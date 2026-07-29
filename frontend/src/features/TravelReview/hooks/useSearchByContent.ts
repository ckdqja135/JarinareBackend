/**
 * @role: features — 게시물 내용 기준 후기 검색
 * @rule: 상태·계산만 담당, 렌더링 금지
 */
import { useMemo } from 'react';
import type { TravelReview } from '@/entities/TravelReview/types/travelReviewType';

export const useSearchByContent = (query: string, reviews: TravelReview[]) => {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q),
    );
  }, [query, reviews]);

  return { results };
};

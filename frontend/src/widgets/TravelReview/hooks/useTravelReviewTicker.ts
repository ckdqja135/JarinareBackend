/**
 * @role: widgets — Ticker 무한 반복 애니메이션 상태 관리
 * @rule: 데이터 가공·슬롯 채우기·루프 복제 로직만 담당, 렌더링 포함 금지
 */
import { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';

const TICKER_COUNT = 5;

export const useTravelReviewTicker = (
  summaries: DestinationReviewSummary[],
) => {
  // 리뷰가 있는 도시만 필터링 후 별점순 상위 4개 선택
  const tickerItems = summaries
    .filter((s) => s.reviewCount > 0)
    .slice(0, TICKER_COUNT);

  // 4개 미만이면 빈 슬롯을 "작성 유도" 카드로 채움
  const emptyCount = TICKER_COUNT - tickerItems.length;
  const filledItems = [
    ...tickerItems,
    ...Array.from({ length: emptyCount }, (_, i) => ({
      city: `__empty_${i}` as const,
      averageRating: 0,
      reviewCount: -1,
    })),
  ];

  // 무한 반복을 위해 아이템 복제
  const loopItems = [...filledItems, ...filledItems];

  return { tickerItems, loopItems };
};

/**
 * @role: features — 페이지네이션 훅 타입 정의
 * @rule: 타입 정의만 담당, 로직 포함 금지
 */
import type {
  TravelReview,
  DestinationReviewSummary,
} from '@/entities/TravelReview/types/travelReviewType';
import type { SearchResultItem } from '../hooks/useSearchTravelReviews';

export type PaginationItem =
  | TravelReview
  | DestinationReviewSummary
  | SearchResultItem;

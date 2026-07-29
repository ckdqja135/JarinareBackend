/**
 * @role: widgets — 추천 여행지 타입 정의
 * @rule: 타입·인터페이스 정의만 담당
 */
export type Category = '전체' | '바다' | '역사' | '맛집' | '자연' | '야경';

export interface DestinationItem {
  city: string;
  desc: string;
  gradient: string;
  category: Category[];
  image?: string;
  emoji?: string;
}

export interface PCDestinationModalProps {
  destination: DestinationItem;
  onClose: () => void;
}

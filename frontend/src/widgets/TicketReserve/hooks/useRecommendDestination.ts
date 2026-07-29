/**
 * @role: widgets — 추천 여행지 필터링 및 선택 상태 관리 Hook
 * @rule: UI 렌더링 로직 포함 금지, 상태 및 데이터 가공만 담당
 */
import { useState } from 'react';
import { useTravelStatic } from './useTravelStatic';
import { Category } from '../types/RecommendDestinationType';
import { CATEGORIES, DESTINATIONS } from '../constants/RecommendConstants';

export const useRecommendDestination = () => {
  const [selected, setSelected] = useState<Category>('전체');
  const [detailCity, setDetailCity] = useState<string | null>(
    DESTINATIONS[0].city,
  );
  const { stats } = useTravelStatic();

  // 카테고리 기준 여행지 필터링
  const filtered =
    selected === '전체'
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.category.includes(selected));

  // 선택된 도시의 통계 데이터 조회
  const detailStat = detailCity
    ? stats.find((s) => s.destination === detailCity)
    : undefined;

  // 같은 카드 재클릭 시 닫힘, 다른 카드 클릭 시 전환
  const handleCardClick = (city: string) => {
    setDetailCity((prev) => (prev === city ? null : city));
  };

  return {
    selected,
    setSelected,
    detailCity,
    detailStat,
    filtered,
    handleCardClick,
    categories: CATEGORIES,
  };
};

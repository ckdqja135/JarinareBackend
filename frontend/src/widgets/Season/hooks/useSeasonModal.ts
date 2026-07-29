/**
 * @role: widgets/Season — hooks
 * @rule: SeasonModal 렌더링 데이터 제공만 담당, UI 포함 금지
 */
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';

export const useSeasonModal = () => {
  const { season, stations, style } = useCurrentSeason();
  return { season, stations, style };
};

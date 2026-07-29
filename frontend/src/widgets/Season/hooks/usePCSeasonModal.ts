/**
 * @role: widgets/Season — hooks
 * @rule: PCSeasonModal 데이터만 담당, UI 포함 금지
 */
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';
import gangneung from '@/assets/background/강릉.png';
import busan from '@/assets/background/부산.png';
import chuncheon from '@/assets/background/춘천.png';
import jeonju from '@/assets/background/전주.png';

const SEASON_IMAGE: Record<string, string> = {
  여름: gangneung,
  겨울: busan,
  봄: chuncheon,
  가을: jeonju,
};

export const usePCSeasonModal = () => {
  const { season, stations, style } = useCurrentSeason();
  const bgImage = SEASON_IMAGE[season];

  return { season, stations, style, bgImage };
};

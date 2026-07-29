/**
 * @role: features — 현재 계절 및 할인 역 반환 훅
 * @rule: 상태·계산만 담당, 렌더링 금지
 */
import {
  getCurrentSeason,
  SEASON_STATIONS,
  SEASON_STYLE,
} from '@/shared/constants/seasonStations';
import type { Season } from '@/shared/constants/seasonStations';

export const useCurrentSeason = () => {
  const season: Season = getCurrentSeason();
  const stations = SEASON_STATIONS[season];
  const style = SEASON_STYLE[season];

  const isSeasonStation = (station: string) =>
    (stations as readonly string[]).includes(station);

  return { season, stations, style, isSeasonStation };
};

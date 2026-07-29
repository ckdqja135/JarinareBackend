/**
 * @role: widgets — PC 도착역 드롭다운 상태·로직 훅
 * @rule: 상태·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { reserveConstants } from '../constants/ReserveConstants';
import {
  getReachableStations,
  normalizeStation,
} from '@/shared/lib/trainRoutes';

export const usePCEndPlaceDropdown = (onClose: () => void) => {
  const [query, setQuery] = useState('');
  const { setEndStation, setEndStationForView, startStationForView } =
    trainDataStore();
  const { stations, isLoading } = trainQueryData();
  const { recommendStationArray } = reserveConstants();

  const reachable = startStationForView
    ? getReachableStations(normalizeStation(startStationForView))
    : null;

  const filtered = stations.filter((s) => {
    if (!s?.nodename) return false;
    if (
      reachable &&
      reachable.length > 0 &&
      !reachable.includes(normalizeStation(s.nodename))
    )
      return false;
    if (query && !s.nodename.includes(query)) return false;
    return true;
  });

  const handleSelect = (id: string, name: string) => {
    setEndStation(id);
    setEndStationForView(name);
    onClose();
  };

  return {
    query,
    setQuery,
    filtered,
    isLoading,
    recommendStationArray,
    handleSelect,
  };
};

/**
 * @role: widgets — PC 출발역 드롭다운 상태·로직 훅
 * @rule: 상태·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { reserveConstants } from '../constants/ReserveConstants';

export const usePCStartPlaceDropdown = (onClose: () => void) => {
  const [query, setQuery] = useState('');
  const { setStartStation, setStartStationForView } = trainDataStore();
  const { stations, isLoading } = trainQueryData();
  const { recommendStationArray } = reserveConstants();

  const filtered = query
    ? stations.filter((s) => s && s.nodename.includes(query))
    : stations;

  const handleSelect = (id: string, name: string) => {
    setStartStation(id);
    setStartStationForView(name);
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

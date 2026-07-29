/**
 * @role: pages — PCHomePage 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { errorStateStore } from '@/features/TicketReserve/model/errorStateStore';
import useModalStore from '@/widgets/model/ReserveStore';
import type { DropdownType } from '../types/PCHomePageTypes';
import type { DestinationItem } from '@/widgets/TicketReserve/types/RecommendDestinationType';

export const usePCHomePage = () => {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    startStation,
    endStation,
    startDay,
    startStationForView,
    endStationForView,
    startDayForView,
    adult,
    kid,
    setStartStation,
    setEndStation,
    setStartStationForView,
    setEndStationForView,
  } = trainDataStore();

  const { refetch } = trainQueryData();
  const { error } = errorStateStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    setStartStation(endStation);
    setEndStation(startStation);
    setStartStationForView(endStationForView);
    setEndStationForView(startStationForView);
  };

  const handleSearch = () => {
    const canSearch =
      startStation && endStation && startDay && startStation !== endStation;
    const hasNetworkError = error === 'Network Error';

    if (canSearch && !hasNetworkError) {
      refetch();
      navigate('/reserve/trainCheck');
    } else if (canSearch && hasNetworkError) {
      openModal('ErrorModal');
    }
  };

  const isSearchDisabled =
    !startStationForView ||
    !endStationForView ||
    !startDayForView ||
    adult + kid === 0;

  return {
    openDropdown,
    setOpenDropdown,
    dropdownRef,
    startStationForView,
    endStationForView,
    startDayForView,
    adult,
    kid,
    handleSwap,
    handleSearch,
    isSearchDisabled,
    selectedDestination,
    setSelectedDestination,
  };
};

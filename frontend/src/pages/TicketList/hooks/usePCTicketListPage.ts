/**
 * @role: pages — PC 내 승차권 페이지 상태 훅
 * @rule: 상태·이벤트 핸들러만 담당, UI 포함 금지
 */
import { useEffect } from 'react';
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useNavigate } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';

export const usePCTicketListPage = () => {
  const { groupedArray } = useTicketLists() ?? {};
  const isEmpty = !groupedArray || groupedArray.length === 0;
  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY);
  const navigate = useNavigate();

  useEffect(() => {
    clearAllSeatsCache();
    prefetchAllSeats();
  }, []);

  const handleSeatChange = (groups: SeatType[]) => {
    navigate('/seatchange', { state: groups });
  };

  return { isEmpty, isLoggedIn, handleSeatChange };
};

import { useMixSeats } from '@/features/TicketChange/hooks/useMixSeats';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 이전 페이지로 이동하거나 해당 주소로 이동 시 이전에 좌석 선택창에서 선택했던 좌석들 초기화
export const useReset = () => {
  const { setKeepSeats, setShareKeepSeats } = useMixSeats();
  const { setSeatsChangeTarget } = seatsChangeTargetStore();
  const locaiton = useLocation();

  useEffect(() => {
    if (location.pathname === '/ticketList') {
      setSeatsChangeTarget([]);
      setKeepSeats([]);
      setShareKeepSeats([]);
    }
  }, [
    locaiton.pathname,
    setSeatsChangeTarget,
    setKeepSeats,
    setShareKeepSeats,
  ]);
};

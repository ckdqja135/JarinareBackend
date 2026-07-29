// @role: features — 좌석 변경 페이지 좌석 상태 폴링
// @rule: api/ 호출만 담당, Firestore 직접 호출 금지
import { backendClient } from '@/shared/api/backendClient';
import { seatsStateStore } from '../models/seatsStateStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';

export const useGetSeatsState = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeInfo, setSeatsChangeInfo } = seatsChangeInfoStore();
  const { setIsSeatsChangeTarget } = seatsChangeTargetStore();
  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();

  const location = useLocation();
  const mySeats: SeatType[] = location.state;

  // 선택된 좌석 수
  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 좌석 변경 페이지 진입 시 좌석 선택 상태 초기화
  useEffect(() => {
    if (location.pathname === '/seatchange') {
      setSeatsState({});
    }
  }, []);

  // 각 호차별 좌석 상태 폴링
  useEffect(() => {
    if (!trainNo || !mySeats?.[0]?.id) return;
    let isMounted = true;

    const fetchSeats = async () => {
      if (!isMounted) return;
      try {
        const { data } = await backendClient.get<SeatType[]>('/api/seats', {
          params: { docId: mySeats[0].id, trainNoId: trainNo },
        });
        if (isMounted) setSeatsChangeInfo(data);
      } catch {
        // 조회 실패 시 유지
      }
    };

    fetchSeats();

    return () => {
      isMounted = false;
    };
  }, [trainNo]);

  // 호차 변경 시 변경할 좌석 상태 초기화
  useEffect(() => {
    setIsSeatsChangeTarget(false);
  }, [trainNo]);

  useEffect(() => {
    // 선택한 좌석 즉시 반영
    setSeatsStateCount(selectedCount);
  }, [seatsState]);

  return { seatsChangeInfo, seatsStateCount };
};

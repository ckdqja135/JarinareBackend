// @role: features — 내 좌석 예약 전체 프리패치 캐시
// @rule: api/ 호출만 담당, Firestore 직접 호출 금지
import { useEffect } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { backendClient } from '@/shared/api/backendClient';
import { auth } from '@/shared/firebase/firebase';

let cachedSeatsAllInfo: SeatType[] = [];
let isFetching = false;
const listeners: Array<(seats: SeatType[]) => void> = [];

const notifyListeners = (seats: SeatType[]) => {
  cachedSeatsAllInfo = seats;
  listeners.forEach((fn) => fn(seats));
};

export const prefetchAllSeats = async () => {
  if (isFetching || cachedSeatsAllInfo.length > 0) return;
  const user = auth.currentUser;
  if (!user) return;

  isFetching = true;
  try {
    const { data } = await backendClient.get<SeatType[]>('/api/seats/me');
    notifyListeners(data);
  } catch {
    // prefetch 실패 시 무시
  } finally {
    isFetching = false;
  }
};

export const getCachedAllSeats = () => cachedSeatsAllInfo;

export const clearAllSeatsCache = () => {
  cachedSeatsAllInfo = [];
};

export const useAllSeatsInfo = (onUpdate: (seats: SeatType[]) => void) => {
  useEffect(() => {
    if (cachedSeatsAllInfo.length > 0) {
      onUpdate(cachedSeatsAllInfo);
    }
    listeners.push(onUpdate);
    return () => {
      const idx = listeners.indexOf(onUpdate);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);
};

// @rule: api/ 호출만 담당, Firestore 직접 호출 금지
import { SeatType } from '@/entities/Seat/types/seatType';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useEffect } from 'react';

// endTime(yyyyMMddHHmm) → Date 변환
const parseEndTime = (endTime: number): Date => {
  const s = String(endTime);
  return new Date(
    Number(s.substring(0, 4)),
    Number(s.substring(4, 6)) - 1,
    Number(s.substring(6, 8)),
    Number(s.substring(8, 10)),
    Number(s.substring(10, 12)),
  );
};

export const useTicketLists = () => {
  const { seatsAllInfo } = useSeatQueryData();
  const user = auth.currentUser;

  // 도착 시간이 지난 티켓 자동 삭제
  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const expired = seatsAllInfo.filter(
      (item) => item.userId === user.uid && parseEndTime(item.endTime) <= now,
    );
    expired.forEach((item) => {
      if (item.reservationId) {
        backendClient
          .delete(`/api/seats/reservations/${item.reservationId}`)
          .catch(() => {});
      }
    });
  }, [seatsAllInfo]);

  if (!user) {
    return;
  }

  const filtered = seatsAllInfo.filter(
    (item) =>
      item.userId === user.uid && parseEndTime(item.endTime) > new Date(),
  );

  // 생성 시간을 key로 하여 2개 이상의 좌석을 선택했을 경우 하나의 배열로 반환
  const groupSeats = filtered.reduce<Record<number, SeatType[]>>(
    (acc, current) => {
      acc[current.createAt] = acc[current.createAt] || [];
      acc[current.createAt].push(current);
      return acc;
    },
    {},
  );
  const groupedArray = Object.values(groupSeats);
  return { groupedArray };
};

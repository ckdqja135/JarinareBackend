// @role: features — 수신된 변경 요청의 요청자 좌석 잠금
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { SeatChangeRequest } from './useChangeResponse';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { useEffect } from 'react';

export const useExistChangeRequestBlocked = () => {
  const { seatsChangeTarget } = seatsChangeTargetStore();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const lockRequesterSeats = async () => {
      try {
        const { data } = await backendClient.get<SeatChangeRequest[]>(
          '/api/seat-change-requests/received',
        );

        const pending = data.filter((r) => r.status === 'pending');

        // 요청자의 좌석을 백엔드 lock API로 잠금
        for (const req of pending) {
          const seat = req.mySeat as {
            docId?: string;
            trainNoId?: string;
            seatId?: string;
          };
          if (seat?.docId && seat?.trainNoId && seat?.seatId) {
            await backendClient
              .post('/api/seat-locks', {
                lockKey: `${seat.docId}/${seat.trainNoId}/${seat.seatId}`,
              })
              .catch(() => {});
          }
        }
      } catch {}
    };

    lockRequesterSeats();
  }, [seatsChangeTarget]);
};

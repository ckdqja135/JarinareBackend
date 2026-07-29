// @role: features — 혼합 변경 요청 충돌 감지
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { SeatChangeRequest } from './useChangeResponse';
import { seatsChangeMixTargetSeatIdStore } from '@/features/TicketChange/models/seatsChangeMixTargetSeatIdStore';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { shareKeepSeatsStore } from '@/features/TicketChange/models/shareKeepSeatsStore';
import { useEffect, useState } from 'react';

export const useExistMixChangeRequestBlocked = () => {
  const { seatsState } = seatsStateStore();
  const { seatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();
  const { shareKeepSeats } = shareKeepSeatsStore();
  const { seatsChangeTarget } = seatsChangeTargetStore();
  const [isExistMixRequestBlocked, setIsExistMixRequestBlocked] = useState<boolean>(false);
  const user = auth.currentUser;

  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      try {
        const { data } = await backendClient.get<SeatChangeRequest[]>(
          '/api/seat-change-requests/received',
        );

        const pending = data.filter((r) => r.status === 'pending');

        // mixTarget 정보는 백엔드 toResponse에 포함되지 않아 targetSeat 기준으로 충돌 감지
        const result = pending.some((req) => {
          const target = req.targetSeat as { docId?: string; trainNoId?: string; seatId?: string };
          return (
            target?.docId === seatsChangeTarget[0]?.id &&
            target?.trainNoId === seatsChangeTarget[0]?.trainNoId &&
            seatsChangeMixTargetSeatId.includes(target?.seatId ?? '')
          );
        });

        setIsExistMixRequestBlocked(result);
      } catch {}
    };

    check();
  }, [seatsState, emptySeatsTarget, shareKeepSeats, seatsChangeMixTargetSeatId]);

  return { isExistMixRequestBlocked };
};

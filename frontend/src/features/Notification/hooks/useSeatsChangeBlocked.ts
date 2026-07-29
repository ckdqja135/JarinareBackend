// @role: features — 내가 보낸 변경 요청 존재 여부로 좌석 변경 차단 여부 판단
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { SeatChangeRequest } from './useChangeResponse';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import { useEffect, useState } from 'react';

export const useSeatsChangeBlocked = () => {
  const { seatsTarget } = seatsTargetStore();
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      try {
        const { data } = await backendClient.get<SeatChangeRequest[]>(
          '/api/seat-change-requests/sent',
        );
        // pending 상태인 발신 요청이 있으면 좌석 변경 불가
        setIsBlocked(data.some((r) => r.status === 'pending'));
      } catch {}
    };

    check();
  }, [seatsTarget]);

  return { isBlocked };
};

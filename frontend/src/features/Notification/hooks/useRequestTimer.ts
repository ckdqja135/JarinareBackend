// @role: features — 좌석 변경 요청 만료 타이머 (백엔드 TTL 기준 1분)
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { SeatChangeRequest } from './useChangeResponse';
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useEffect, useState } from 'react';

const TTL_MS = 60 * 1000; // 백엔드 expiresAt = createdAt + 1분

// 요청자 쪽 타이머: 내가 보낸 pending 요청의 남은 시간
export const useRequestSenderTimer = () => {
  const location = useLocation();
  const mySeats: SeatType[] = location.state;
  const user = auth.currentUser;
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !mySeats?.[0]) return;
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const { data } = await backendClient.get<SeatChangeRequest[]>(
          '/api/seat-change-requests/sent',
        );
        const pending = data.find((r) => r.status === 'pending');

        if (!pending) {
          if (intervalId) clearInterval(intervalId);
          if (isMounted) setRemaining(null);
          return;
        }

        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
          const expiresAt = (pending.createdAt + TTL_MS / 1000) * 1000;
          const left = Math.max(0, expiresAt - Date.now());
          if (isMounted) setRemaining(Math.ceil(left / 1000));
          if (left <= 0 && intervalId) clearInterval(intervalId);
        }, 1000);
      } catch {}
    };

    poll();
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { remaining };
};

// 수신자 쪽 타이머: 특정 요청의 남은 시간 (requestId 기준)
export const useRequestReceiverTimer = (
  createdAt: number | null | undefined,
  _requestId: string | null,
) => {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!createdAt) return;

    const tick = () => {
      const expiresAt = (createdAt + TTL_MS / 1000) * 1000;
      const left = Math.max(0, expiresAt - Date.now());
      setRemaining(Math.ceil(left / 1000));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  return { remaining };
};

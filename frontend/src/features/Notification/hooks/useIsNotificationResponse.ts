// @role: features — 수신된 좌석 변경 요청 활성화 여부 폴링
// @rule: api/ 호출만 담당, Firestore 직접 호출 금지
import { backendClient } from '@/shared/api/backendClient';
import { auth } from '@/shared/firebase/firebase';
import { SeatChangeRequest } from './useChangeResponse';
import { useEffect, useState } from 'react';

export const useIsNotificationResponse = () => {
  const [receivedRequests, setReceivedRequests] = useState<SeatChangeRequest[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetch = async () => {
      try {
        const { data } = await backendClient.get<SeatChangeRequest[]>(
          '/api/seat-change-requests/received',
        );
        if (isMounted) setReceivedRequests(data.filter((r) => r.status === 'pending'));
      } catch {}
    };

    fetch();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // 구버전 호환: isNotification.data()?.change 형태 대신 hasPendingChange / hasPendingResponse
  const hasPendingChange = receivedRequests.length > 0;

  return { isNotification: undefined, receivedRequests, hasPendingChange };
};

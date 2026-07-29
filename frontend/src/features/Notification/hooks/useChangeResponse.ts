// @role: features — 수신된 좌석 변경 요청 폴링
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useQuery } from '@tanstack/react-query';

export type SeatChangeRequest = {
  id: string;
  requesterUid: string;
  receiverUid: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  mySeat: Record<string, unknown>[];
  targetSeat: Record<string, unknown>;
  isRead: boolean;
  createdAt: number;
};

export const useChangeResponse = () => {
  const user = auth.currentUser;

  const { data } = useQuery({
    queryKey: ['seat-change-requests', 'received', user?.uid],
    queryFn: async () => {
      const { data } = await backendClient.get<SeatChangeRequest[]>(
        '/api/seat-change-requests/received',
      );
      return data
        .filter((r) => r.status === 'pending')
        .map((r) => ({
          ...r,
          mySeat: Array.isArray(r.mySeat) ? r.mySeat : r.mySeat ? [r.mySeat] : [],
        }));
    },
    enabled: !!user,
    staleTime: 0,
  });

  const safeRequests = (Array.isArray(data) ? data : []).map((r) => ({
    ...r,
    mySeat: Array.isArray(r.mySeat) ? r.mySeat : r.mySeat ? [r.mySeat] : [],
  }));
  return { response: safeRequests, requests: safeRequests };
};

// @role: features — 내가 보낸 좌석 변경 요청의 수락/거절 상태 폴링
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { SeatChangeRequest } from './useChangeResponse';
import { useQuery } from '@tanstack/react-query';

export const useIsAcceptResponse = () => {
  const user = auth.currentUser;

  const { data } = useQuery({
    queryKey: ['seat-change-requests', 'sent', user?.uid],
    queryFn: async () => {
      const { data } = await backendClient.get<SeatChangeRequest[]>(
        '/api/seat-change-requests/sent',
      );
      return data;
    },
    enabled: !!user,
    staleTime: 0,
  });

  const safeRequests = Array.isArray(data) ? data : [];
  const acceptedRequests = safeRequests.filter((r) => r.status === 'accepted');
  const rejectedRequests = safeRequests.filter((r) => r.status === 'rejected');

  return {
    sentRequests: safeRequests,
    acceptResponse: acceptedRequests.length > 0 ? acceptedRequests : undefined,
    refuseResponse: rejectedRequests.length > 0 ? rejectedRequests : undefined,
  };
};

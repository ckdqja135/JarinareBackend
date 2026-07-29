// @role: features — 출발 알림 폴링
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { BackendNotification } from '@/features/Follow/hooks/useFollowNotification';
import { useQuery } from '@tanstack/react-query';

export const useReadStartTime = () => {
  const user = auth.currentUser;

  const { data } = useQuery({
    queryKey: ['notifications', 'departure_soon', user?.uid],
    queryFn: async () => {
      const { data } = await backendClient.get<BackendNotification[]>(
        '/api/notifications',
        { params: { type: 'departure_soon' } },
      );
      return data;
    },
    enabled: !!user,
    staleTime: 0,
  });

  return { readStartTime: undefined, departureNotifs: Array.isArray(data) ? data : [] };
};

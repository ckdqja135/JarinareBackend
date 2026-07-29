/**
 * @role: features — 팔로우 알림 폴링
 * @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useQuery } from '@tanstack/react-query';

export type BackendNotification = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: number;
};

export const useFollowNotification = () => {
  const user = auth.currentUser;

  const { data } = useQuery({
    queryKey: ['notifications', 'follow', user?.uid],
    queryFn: async () => {
      const { data } = await backendClient.get<BackendNotification[]>(
        '/api/notifications',
        { params: { type: 'follow' } },
      );
      return data;
    },
    enabled: !!user,
    staleTime: 0,
  });

  return { followNotifications: data ?? [] };
};

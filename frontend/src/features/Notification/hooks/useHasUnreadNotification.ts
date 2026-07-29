/**
 * @role: features — 미읽은 알림 존재 여부 감지
 * @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useQuery } from '@tanstack/react-query';

export const useHasUnreadNotification = () => {
  const user = auth.currentUser;

  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count', user?.uid],
    queryFn: async () => {
      const { data } = await backendClient.get<{ count: number }>(
        '/api/notifications/unread-count',
      );
      return data.count;
    },
    enabled: !!user,
    staleTime: 0,
  });

  return { hasUnread: (data ?? 0) > 0 };
};

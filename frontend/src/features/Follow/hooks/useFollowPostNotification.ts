/**
 * @role: features — 팔로잉 사용자 게시글 알림 폴링
 * @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { BackendNotification } from './useFollowNotification';
import { useQuery } from '@tanstack/react-query';

export const useFollowPostNotification = () => {
  const user = auth.currentUser;

  const { data } = useQuery({
    queryKey: ['notifications', 'following_post', user?.uid],
    queryFn: async () => {
      const { data } = await backendClient.get<BackendNotification[]>(
        '/api/notifications',
        { params: { type: 'following_post' } },
      );
      return data;
    },
    enabled: !!user,
    staleTime: 0,
  });

  return { followPostNotifications: data ?? [] };
};

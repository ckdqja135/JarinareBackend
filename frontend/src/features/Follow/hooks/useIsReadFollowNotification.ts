/**
 * @role: features — 팔로우 관련 알림 읽음 상태 처리
 * @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
 */
import { backendClient } from '@/shared/api/backendClient';
import { auth } from '@/shared/firebase/firebase';
import { useFollowNotification } from './useFollowNotification';
import { useTopFollowerNotification } from './useTopFollowerNotification';
import { useFollowPostNotification } from './useFollowPostNotification';

export const useIsReadFollowNotification = () => {
  const { followNotifications } = useFollowNotification();
  const { topFollowerNotifications } = useTopFollowerNotification();
  const { followPostNotifications } = useFollowPostNotification();
  const user = auth.currentUser;

  const updateFollowResponse = async (notificationId: string) => {
    if (!user) return;
    await backendClient.patch(`/api/notifications/${notificationId}/read`);
  };

  const updateTopFollowerResponse = async (notificationId: string) => {
    if (!user) return;
    await backendClient.patch(`/api/notifications/${notificationId}/read`);
  };

  const updateFollowPostResponse = async (notificationId: string) => {
    if (!user) return;
    await backendClient.patch(`/api/notifications/${notificationId}/read`);
  };

  const updateAllFollowResponse = async () => {
    if (!user) return;
    await backendClient.patch('/api/notifications/read-all');
  };

  return {
    followNotifications: Array.isArray(followNotifications) ? followNotifications : [],
    topFollowerNotifications: Array.isArray(topFollowerNotifications) ? topFollowerNotifications : [],
    followPostNotifications: Array.isArray(followPostNotifications) ? followPostNotifications : [],
    updateFollowResponse,
    updateTopFollowerResponse,
    updateFollowPostResponse,
    updateAllFollowResponse,
  };
};

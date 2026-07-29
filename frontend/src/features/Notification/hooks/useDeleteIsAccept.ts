// @role: features — 수락/거절 알림 읽음 처리
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { backendClient } from '@/shared/api/backendClient';

export const useDeleteIsAccept = () => {
  // 거절 알림 읽음 처리 (notificationId: seat_change_response 알림 ID)
  const deleteRefuse = async (notificationId: string) => {
    await backendClient.patch(`/api/notifications/${notificationId}/read`).catch(() => {});
  };

  // 수락 알림 읽음 처리 (notificationId: seat_change_response 알림 ID)
  const deleteAccept = async (notificationId: string) => {
    await backendClient.patch(`/api/notifications/${notificationId}/read`).catch(() => {});
  };

  return { deleteAccept, deleteRefuse };
};

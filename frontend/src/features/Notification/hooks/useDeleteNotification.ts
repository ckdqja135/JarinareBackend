// @role: features — 좌석 변경 요청 처리 후 알림 읽음 처리
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { backendClient } from '@/shared/api/backendClient';

export const useDeleteNotification = () => {
  // 수락/거절 후 seat_change_request 알림을 읽음으로 표시
  const deleteRequsetAndResponse = async (requestId: string) => {
    await backendClient.post(`/api/seat-change-requests/${requestId}/read`).catch(() => {});
  };

  return { deleteRequsetAndResponse };
};

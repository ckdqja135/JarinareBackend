/**
 * @role: features — 승차권 관련 알림 읽음 상태 처리
 * @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useChangeResponse } from './useChangeResponse';
import { useIsAcceptResponse } from './useIsAcceptResponse';
import { useReadStartTime } from './useReadStartTime';

export const useIsReadNotification = () => {
  const { response } = useChangeResponse();
  const { acceptResponse, refuseResponse } = useIsAcceptResponse();
  const { readStartTime, departureNotifs } = useReadStartTime();
  const user = auth.currentUser;

  // 좌석 변경 요청 읽음 (requestId: seat_change_requests UUID)
  const updateChangeResponse = async (requestId: string) => {
    if (!user) return;
    await backendClient.post(`/api/seat-change-requests/${requestId}/read`);
  };

  const updateAcceptResponse = async (requestId: string) => {
    if (!user) return;
    await backendClient.post(`/api/seat-change-requests/${requestId}/read`);
  };

  const updateRefuseResponse = async (requestId: string) => {
    if (!user) return;
    await backendClient.post(`/api/seat-change-requests/${requestId}/read`);
  };

  // 출발 알림 읽음 (notificationId: notifications UUID)
  const updateStartTimeResponse = async (notificationId: string) => {
    if (!user) return;
    await backendClient.patch(`/api/notifications/${notificationId}/read`);
  };

  // 전체 알림 읽음 처리
  const updateAllResponse = async () => {
    if (!user) return;
    await backendClient.patch('/api/notifications/read-all');
  };

  return {
    response,
    acceptResponse,
    refuseResponse,
    readStartTime,
    departureNotifs,
    updateChangeResponse,
    updateAcceptResponse,
    updateRefuseResponse,
    updateStartTimeResponse,
    updateAllResponse,
  };
};

// @role: features — 수신된 좌석 변경 요청 수락 처리
// @rule: api/ 호출만 담당, Firestore/RealtimeDB 직접 호출 금지
import { backendClient } from '@/shared/api/backendClient';
import { auth } from '@/shared/firebase/firebase';

export const useHandleChange = () => {
  // requestId: 수신된 SeatChangeRequest.id (UUID)
  // 백엔드가 좌석 교체 + changeCount 증가 + 포인트 지급 + 알림 발송 처리
  const handleClick = async (requestId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await backendClient.post(`/api/seat-change-requests/${requestId}/respond`, {
      response: 'accepted',
    });
  };

  return { handleClick };
};

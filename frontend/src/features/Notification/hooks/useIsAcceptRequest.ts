// @role: features — 좌석 변경 요청 수락/거절 전송
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { backendClient } from '@/shared/api/backendClient';

export const useIsAcceptRequest = () => {
  // 수락: 백엔드가 좌석 교체 + 알림 발송 처리
  const accpetRequest = async (_requestId: string) => {
    // useHandleChange.handleClick에서 respond API를 호출하므로 여기서는 no-op
  };

  // 거절: 백엔드가 상태 변경 + 알림 발송 처리
  const refuseRequest = async (requestId: string) => {
    await backendClient.post(`/api/seat-change-requests/${requestId}/respond`, {
      response: 'rejected',
    });
  };

  return { accpetRequest, refuseRequest };
};

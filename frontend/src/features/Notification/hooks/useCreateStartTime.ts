// @role: features — 출발 알림 생성 (백엔드 cron으로 자동 처리됨)
// @rule: 백엔드 departure-notification.service.ts가 출발 알림을 자동 발송하므로 클라이언트 직접 생성 불필요
import { SeatType } from '@/entities/Seat/types/seatType';

export const useCreateStartTime = () => {
  const creatStartTime = async (_timeDifferenceData: SeatType[][]) => {};
  return { creatStartTime };
};

/**
 * @role: pages — PC 구간 티켓 아이템 데이터 가공 훅
 * @rule: useTicketDetail 위임만 담당, UI 포함 금지
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { useTicketDetail } from '@/features/TicketChange/hooks/useTicketDetail';

export const usePCRouteTicketItem = (groups: SeatType[]) => {
  return useTicketDetail(groups);
};

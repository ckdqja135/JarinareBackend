// @role: features — 좌석 변경 요청 전송
// @rule: api/ 호출만 담당, RealtimeDB 직접 호출 금지
import { SeatType } from '@/entities/Seat/types/seatType';
import { useEmptySeats } from '@/features/TicketChange/hooks/useEmptySeats';
import { seatsChangeInfoStore } from '@/features/TicketChange/models/seatsChangeInfoStore';
import { seatsChangeMixTargetSeatIdStore } from '@/features/TicketChange/models/seatsChangeMixTargetSeatIdStore';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { shareKeepSeatsStore } from '@/features/TicketChange/models/shareKeepSeatsStore';
import { backendClient } from '@/shared/api/backendClient';
import { useLocation } from 'react-router-dom';

export const useChangeRequest = () => {
  const location = useLocation();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { shareKeepSeats } = shareKeepSeatsStore();
  const { isSeatsChangeTarget } = seatsChangeTargetStore();
  const { seatsState } = seatsStateStore();
  const { emptySeatsChange } = useEmptySeats();
  const { seatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();

  const mySeats: SeatType[] = location.state;

  // 빈 좌석으로 이동하는 좌석 ID 목록
  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  // 좌석 변경 요청
  const changeRequset = async (target: string[]) => {
    const targetSeats = seatsChangeInfo.filter((item) =>
      target.includes(item.seatId),
    );

    if (targetSeats.length > 0) {
      // 상대방이 예매한 좌석으로 변경 요청
      await backendClient.post('/api/seat-change-requests', {
        requesterSeatId: mySeats[0].reservationId,
        receiverSeatId: targetSeats[0].reservationId,
        isSeatsChangeTarget,
        seatIds: mySeats.map((item) => item.seatId),
        emptySeatsTarget,
        mixTarget: {
          seatsChangeMixTargetSeatId,
          id: targetSeats[0].id,
          trainNoId: targetSeats[0].trainNoId,
        },
      });
    } else {
      // 빈 좌석으로 직접 이동 (상대방 없음)
      await emptySeatsChange(emptySeatsTarget);
    }
  };

  return { changeRequset };
};

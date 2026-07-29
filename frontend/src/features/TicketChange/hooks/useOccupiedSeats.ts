// @role: features — 예매 좌석 교체 (백엔드 respond API로 처리됨)
// @rule: 백엔드 seat-changes.service.ts respond가 좌석 교체를 처리하므로 직접 Firestore 호출 불필요
import { SeatType } from '@/entities/Seat/types/seatType';

export const useOccupiedSeats = () => {
  const occupiedSeatsChange = async (
    _groupSeats: SeatType[],
    _seatsChangeTarget: SeatType[],
  ) => {};

  return { occupiedSeatsChange };
};

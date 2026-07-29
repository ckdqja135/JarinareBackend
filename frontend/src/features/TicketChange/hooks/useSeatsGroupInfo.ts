import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsChangeInfoStore } from '@/features/TicketChange/models/seatsChangeInfoStore';

export const useSeatsGroupInfo = () => {
  const { seatsChangeInfo } = seatsChangeInfoStore();

  // 생성 시간을 key로 하여 2개 이상의 좌석을 선택했을 경우 하나의 배열로 반환
  const groupSeats = seatsChangeInfo.reduce<Record<number, SeatType[]>>(
    (acc, current) => {
      acc[current.createAt] = acc[current.createAt] || [];
      acc[current.createAt].push(current);
      return acc;
    },
    {},
  );
  const groupedArray = Object.values(groupSeats);
  return { groupedArray };
};

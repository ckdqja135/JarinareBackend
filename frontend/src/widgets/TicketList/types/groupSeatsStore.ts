import { SeatType } from '@/entities/Seat/types/seatType';

export type GroupSeatsStoreType = {
  groupSeats: SeatType[];
  setGroupSeats: (type: SeatType[]) => void;
};

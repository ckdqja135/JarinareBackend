import { SeatType } from '@/entities/Seat/types/seatType';

export type SeatsInfoStoreType = {
  seatsInfo: SeatType[];
  setSeatsInfo: (type: SeatType[]) => void;
};

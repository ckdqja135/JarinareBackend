import { SeatType } from '@/entities/Seat/types/seatType';

export type SeatsChangeInfoStoreType = {
  seatsChangeInfo: SeatType[];
  setSeatsChangeInfo: (type: SeatType[]) => void;
};

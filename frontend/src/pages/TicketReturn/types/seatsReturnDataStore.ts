import { SeatType } from '@/entities/Seat/types/seatType';

export type SeatsReturnDataStore = {
  seatsReturnData: SeatType[];
  setSeatsReturnData: (type: SeatType[]) => void;
};

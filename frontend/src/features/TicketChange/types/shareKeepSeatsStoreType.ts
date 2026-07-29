import { SeatType } from '@/entities/Seat/types/seatType';

export type ShareKeepSeatsStoreType = {
  shareKeepSeats: SeatType[];
  setShareKeepSeats: (type: SeatType[]) => void;
};

import { SeatType } from './seatType';

export type SeatLockType = {
  userId: string;
  trainNo: string;
  mySeats: SeatType[];
};

import { SeatType } from '@/entities/Seat/types/seatType';

export type StartTimeNotificationType = {
  createdAt: number;
  seats: SeatType[];
  onClick: () => void;
  isRead: boolean;
};

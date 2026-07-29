import { SeatType } from '@/entities/Seat/types/seatType';

export type IsAcceptRepsonseProps = {
  responseTitle: string;
  responseTime: number;
  responseContant: SeatType[];
  responseDeleteContant: SeatType[];
  onClick: () => void;
  isRead: boolean;
};

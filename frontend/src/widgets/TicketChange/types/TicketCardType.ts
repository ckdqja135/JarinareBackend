import { SeatType } from '@/entities/Seat/types/seatType';

export interface TicketCardProps {
  s: SeatType;
  filtred: string[];
  qrValue: string;
  startHH: string;
  startMM: string;
  endHH: string;
  endMM: string;
  durText: string;
}

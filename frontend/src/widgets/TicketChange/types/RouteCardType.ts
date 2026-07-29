import { SeatType } from '@/entities/Seat/types/seatType';

export interface RouteCardProps {
  s: SeatType;
  segmentStations: string[];
  departure: Date;
  arrival: Date;
  dur: number;
  durText: string;
}

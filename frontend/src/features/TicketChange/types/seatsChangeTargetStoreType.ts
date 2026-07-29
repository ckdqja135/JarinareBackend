import { SeatType } from '@/entities/Seat/types/seatType';

export type SeatsChangeTargetStoreType = {
  isSeatsChangeTarget: boolean;
  seatsChangeTarget: SeatType[];
  isSeatsChangeLittleTarget: string[];
  setIsSeatsChangeTarget: (type: boolean) => void;
  setSeatsChangeTarget: (type: SeatType[]) => void;
  setIsSeatsChangeLittleTarget: (type: string[]) => void;
};

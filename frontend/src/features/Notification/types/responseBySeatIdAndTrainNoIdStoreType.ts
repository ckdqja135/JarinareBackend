import { SeatType } from '@/entities/Seat/types/seatType';

export type ResponseBySeatIdAndTrainNoIdStoreType = {
  seatIdsAndTrainNoId: SeatType[];
  setSeatIdsAndTrainNoId: (type: SeatType[]) => void;
};

import { create } from 'zustand';
import { ResponseBySeatIdAndTrainNoIdStoreType } from '../types/responseBySeatIdAndTrainNoIdStoreType';
import { SeatType } from '@/entities/Seat/types/seatType';

export const responesBySeatIdTrainNoIdStore =
  create<ResponseBySeatIdAndTrainNoIdStoreType>((set) => ({
    seatIdsAndTrainNoId: [],
    setSeatIdsAndTrainNoId: (seatIdsAndTrainNoId: SeatType[]) =>
      set(() => ({ seatIdsAndTrainNoId })),
  }));

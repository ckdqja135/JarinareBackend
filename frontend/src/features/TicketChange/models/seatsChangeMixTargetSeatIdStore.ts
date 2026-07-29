import { create } from 'zustand';
import { SeatsChangeMixTargetSeatIdStoreType } from '../types/seatsChangeMixTargetSeatIdStoreType';

export const seatsChangeMixTargetSeatIdStore =
  create<SeatsChangeMixTargetSeatIdStoreType>((set) => ({
    seatsChangeMixTargetSeatId: [],
    setSeatsChangeMixTargetSeatId: (seatsChangeMixTargetSeatId: string[]) =>
      set(() => ({ seatsChangeMixTargetSeatId })),
  }));

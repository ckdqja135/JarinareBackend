import { create } from 'zustand';
import { SeatType } from '@/entities/Seat/types/seatType';
import { SeatsChangeTargetStoreType } from '../types/seatsChangeTargetStoreType';

export const seatsChangeTargetStore = create<SeatsChangeTargetStoreType>(
  (set) => ({
    isSeatsChangeTarget: false,
    seatsChangeTarget: [],
    isSeatsChangeLittleTarget: [],
    setIsSeatsChangeTarget: (isSeatsChangeTarget: boolean) =>
      set(() => ({ isSeatsChangeTarget })),
    setSeatsChangeTarget: (seatsChangeTarget: SeatType[]) =>
      set(() => ({ seatsChangeTarget })),
    setIsSeatsChangeLittleTarget: (isSeatsChangeLittleTarget: string[]) =>
      set(() => ({ isSeatsChangeLittleTarget })),
  }),
);

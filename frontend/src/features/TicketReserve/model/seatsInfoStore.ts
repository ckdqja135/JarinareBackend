import { create } from 'zustand';
import { SeatsInfoStoreType } from '../types/seatsInfoStoreType';
import { SeatType } from '@/entities/Seat/types/seatType';

export const seatsInfoStore = create<SeatsInfoStoreType>((set) => ({
  seatsInfo: [],
  setSeatsInfo: (seatsInfo: SeatType[]) => set(() => ({ seatsInfo })),
}));

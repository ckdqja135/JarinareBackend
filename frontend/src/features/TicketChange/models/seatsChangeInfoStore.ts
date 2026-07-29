import { create } from 'zustand';
import { SeatType } from '@/entities/Seat/types/seatType';
import { SeatsChangeInfoStoreType } from '../types/seatsChangeInfoStore';

export const seatsChangeInfoStore = create<SeatsChangeInfoStoreType>((set) => ({
  seatsChangeInfo: [],
  setSeatsChangeInfo: (seatsChangeInfo: SeatType[]) =>
    set(() => ({ seatsChangeInfo })),
}));

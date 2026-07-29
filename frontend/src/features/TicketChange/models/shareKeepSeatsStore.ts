import { create } from 'zustand';
import { SeatType } from '@/entities/Seat/types/seatType';
import { ShareKeepSeatsStoreType } from '../types/shareKeepSeatsStoreType';

export const shareKeepSeatsStore = create<ShareKeepSeatsStoreType>((set) => ({
  shareKeepSeats: [],
  setShareKeepSeats: (shareKeepSeats: SeatType[]) =>
    set(() => ({ shareKeepSeats })),
}));

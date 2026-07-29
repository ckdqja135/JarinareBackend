import { create } from 'zustand';
import { SeatIdsStoreType } from '../types/seatIdsStoreType';

export const seatIdsStore = create<SeatIdsStoreType>((set) => ({
  id: '',
  setId: (id: string) => set(() => ({ id })),
}));

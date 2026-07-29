import { create } from 'zustand';
import { SeatsStateCountStoreType } from '../types/seatsStateCountStoreType';

export const seatsStateCountStore = create<SeatsStateCountStoreType>((set) => ({
  seatsStateCount: 0,
  setSeatsStateCount: (seatsStateCount: number) =>
    set(() => ({ seatsStateCount })),
}));

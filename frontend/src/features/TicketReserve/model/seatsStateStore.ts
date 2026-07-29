import { create } from 'zustand';
import { SeatsStateStore } from '../types/seatsStoreType';

export const seatsStateStore = create<SeatsStateStore>((set) => ({
  seatsState: {},
  setSeatsState: (seatsState: Record<string, boolean>) =>
    set(() => ({ seatsState })),
}));

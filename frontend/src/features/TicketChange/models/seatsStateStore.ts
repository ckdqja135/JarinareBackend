import { create } from 'zustand';
import { SeatsStateStoreType } from '../types/seatsStateStoreType';

export const seatsStateStore = create<SeatsStateStoreType>((set) => ({
  seatsState: {},
  setSeatsState: (seatsState: Record<string, boolean>) =>
    set(() => ({ seatsState })),
}));

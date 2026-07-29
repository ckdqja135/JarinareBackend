import { create } from 'zustand';
import { SeatsChangeCountStoreType } from '../types/seatsChangeCountStoreType';

export const seatsChangeCountStore = create<SeatsChangeCountStoreType>(
  (set) => ({
    changeCount: 0,
    setChangeCount: (changeCount: number) => set(() => ({ changeCount })),
  }),
);

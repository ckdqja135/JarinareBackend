import { create } from 'zustand';
import { ResponseBySeatIdStoreType } from '../types/responseBySeatIdStoreType';

export const responesBySeatIdStore = create<ResponseBySeatIdStoreType>(
  (set) => ({
    seatIds: [],
    setSeatIds: (seatIds: string[]) => set(() => ({ seatIds })),
  }),
);

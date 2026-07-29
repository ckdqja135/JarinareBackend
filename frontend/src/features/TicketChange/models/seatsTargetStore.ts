import { create } from 'zustand';
import { SeatsTargetStoreType } from '../types/seatsTargetStoreType';

export const seatsTargetStore = create<SeatsTargetStoreType>((set) => ({
  seatsTarget: [],
  setSeatsTarget: (seatsTarget: string[]) => set(() => ({ seatsTarget })),
}));

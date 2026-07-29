import { create } from 'zustand';
import { PrevSeatsTargetStoreType } from '../types/prevSeatsTargetStoreType';

export const prevSeatsTargetStore = create<PrevSeatsTargetStoreType>((set) => ({
  prevSeatsTarget: [],
  setPrevSeatsTarget: (prevSeatsTarget: string[]) =>
    set(() => ({ prevSeatsTarget })),
}));

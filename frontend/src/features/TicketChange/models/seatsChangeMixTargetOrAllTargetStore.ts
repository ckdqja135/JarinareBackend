import { create } from 'zustand';
import { ShareSeatsChangeMixTargetOrAllTargetStoreType } from '../types/seatsChangeMixTargetOrAllTargetStoreType';

export const shareSeatsChangeMixTargetOrAllTargetStore =
  create<ShareSeatsChangeMixTargetOrAllTargetStoreType>((set) => ({
    shareSeatsChangeMixTargetOrAllTarget: [],
    setShareSeatsChangeMixTargetOrAllTarget: (
      shareSeatsChangeMixTargetOrAllTarget: string[],
    ) => set(() => ({ shareSeatsChangeMixTargetOrAllTarget })),
  }));

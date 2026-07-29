import { create } from 'zustand';
import { DeleteLocksByRequestStoreType } from '../types/deleteLocksByRequestStoreType';

export const deleteLocksByRequestStore = create<DeleteLocksByRequestStoreType>(
  (set) => ({
    requestDocsId: '',
    requestTrainNo: '',
    requestSeatId: [],
    setDeleteLocksByRequest: (
      requestDocsId: string,
      requestTrainNo: string,
      requestSeatId: string[],
    ) => set(() => ({ requestDocsId, requestTrainNo, requestSeatId })),
  }),
);

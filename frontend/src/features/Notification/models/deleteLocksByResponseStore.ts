import { create } from 'zustand';
import { DeleteLocksByResponseStoreType } from '../types/deleteLocksByResponseStoreType';

export const deleteLocksByResponseStore =
  create<DeleteLocksByResponseStoreType>((set) => ({
    responseDocsId: '',
    responseTrainNo: '',
    responseSeatId: [],
    setDeleteLocksByResponse: (
      responseDocsId: string,
      responseTrainNo: string,
      responseSeatId: string[],
    ) => set(() => ({ responseDocsId, responseTrainNo, responseSeatId })),
  }));

export type DeleteLocksByRequestStoreType = {
  requestDocsId: string;
  requestTrainNo: string;
  requestSeatId: string[];
  setDeleteLocksByRequest: (
    requestDocsId: string,
    requestTrainNo: string,
    requestSeatId: string[],
  ) => void;
};

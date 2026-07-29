export type DeleteLocksByResponseStoreType = {
  responseDocsId: string;
  responseTrainNo: string;
  responseSeatId: string[];
  setDeleteLocksByResponse: (
    responseDocsId: string,
    responseTrainNo: string,
    responseSeatId: string[],
  ) => void;
};

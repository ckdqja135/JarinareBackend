export type StationProps = {
  nodeid: string;
  nodename: string;
}[];

export type TrainTimeProps = {
  adultcharge: number;
  arrplacename: string;
  arrplandtime: number;
  depplacename: string;
  depplandtime: number;
  traingradename: string;
  trainno: number;
}[];

export type QueryDataProps = {
  stations: StationProps;
  trainTime: TrainTimeProps;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

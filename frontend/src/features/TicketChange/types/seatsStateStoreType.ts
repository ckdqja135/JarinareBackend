export type SeatsStateStoreType = {
  seatsState: Record<string, boolean>;
  setSeatsState: (type: Record<string, boolean>) => void;
};

export type SeatsStateStore = {
  seatsState: Record<string, boolean>;
  setSeatsState: (type: Record<string, boolean>) => void;
};

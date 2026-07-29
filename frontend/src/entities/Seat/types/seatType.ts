export type SeatType = {
  seatId: string;
  userId: string;
  trainNoId: string;
  startDay: string;
  startTime: number;
  endTime: number;
  trainType: string;
  createAt: number;
  startDayForView: string;
  startStationForView: string;
  endStationForView: string;
  selectKid: number;
  selectAdult: number;
  selectPay: number;
  id: string;
  reservationId?: string;
};

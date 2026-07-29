export type TicketListProps = {
  title: string;
  text: string;
  textColor: string;
};

export type TicketProps = {
  startTime: number;
  endTime: number;
  trainType: string;
  startDayForView: string;
  trainNoId: string;
  seatIds: string[];
  selectKid: number;
  selectAdult: number;
  selectPay: number;
};

export type TicketButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};

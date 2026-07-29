/**
 * @role: entities — 주문 내역 타입 정의
 * @rule: 타입 정의만 담당, 로직 포함 금지
 */
export type OrderType = {
  startStationForView: string;
  endStationForView: string;
  startDay: string;
  startDayForView: string;
  trainType: string;
  selectAdult: number;
  selectKid: number;
  seatCount: number;
  finalPrice: number;
  paymentMethod: string;
  selectedCard: string | null;
  isReturn: boolean;
  createAt: number;
};

/**
 * @role: widgets/TicketReserve — constants
 * @rule: 결제 모달 상수만 담당
 */

export const PAYMENT_METHODS = ['신용카드', '간편결제', '계좌이체'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CARD_LIST = [
  {
    name: '국민',
    badge: 'KB',
    note: '5% 청구',
    noteColor: '#0062FF',
    bannerColor: '#0062FF',
    color: '#FFBC00',
    discount: 0,
    payback: 0,
    message: '국민카드 이용 시 결제 후 5% 청구할인이 적용됩니다.',
  },
  {
    name: '신한',
    badge: '신한',
    note: '10% 할인',
    noteColor: '#F97316',
    bannerColor: '#F97316',
    color: '#0046FF',
    discount: 0.1,
    payback: 0,
    message: '신한카드 이용 시 10% 즉시할인이 적용됩니다.',
  },
  {
    name: '삼성',
    badge: '삼성',
    bannerColor: '#7C3AED',
    color: '#1428A0',
    discount: 0.025,
    payback: 0,
    message: '삼성카드 이용 시 2.5% 청구할인이 적용됩니다.',
  },
  {
    name: '현대',
    badge: '현대',
    note: '20% 페이백',
    noteColor: '#2DD4BF',
    bannerColor: '#2DD4BF',
    color: '#002C5F',
    discount: 0,
    payback: 0.2,
    message: '현대카드 이용 시 결제금액의 20%가 포인트로 적립됩니다.',
  },
  {
    name: '롯데',
    badge: '롯데',
    bannerColor: '#7C3AED',
    color: '#E40001',
    discount: 0.03,
    payback: 0,
    message: '롯데카드 이용 시 3% 청구할인이 적용됩니다.',
  },
  {
    name: '농협',
    badge: 'NH',
    bannerColor: '#7C3AED',
    color: '#009644',
    discount: 0.015,
    payback: 0,
    message: '농협카드 이용 시 1.5% 청구할인이 적용됩니다.',
  },
  {
    name: '하나',
    badge: '하나',
    bannerColor: '#7C3AED',
    color: '#01AA5B',
    discount: 0.02,
    payback: 0,
    message: '하나카드 이용 시 2% 청구할인이 적용됩니다.',
  },
  {
    name: 'BC',
    badge: 'BC',
    bannerColor: '#7C3AED',
    color: '#F04E23',
    discount: 0.01,
    payback: 0,
    message: 'BC카드 이용 시 1% 청구할인이 적용됩니다.',
  },
] as const;

export type CardName = (typeof CARD_LIST)[number]['name'];

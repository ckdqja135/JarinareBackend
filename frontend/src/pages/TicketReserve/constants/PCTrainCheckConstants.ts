/**
 * @role: pages/TicketReserve — constants
 * @rule: 상수 정의만 담당
 */

export const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

export const TOTAL_SEATS = 24 * 4;

export const SEATS_PER_CAR = 24;

export const TRAIN_OPTIONS = [
  { id: '00', label: 'KTX' },
  { id: '01', label: '새마을호' },
  { id: '02', label: '무궁화호' },
  { id: '03', label: '통근열차' },
  { id: '04', label: '누리호' },
  { id: '06', label: 'AREX직통' },
  { id: '07', label: 'KTX-산천A' },
  { id: '08', label: 'ITX-새마을호' },
  { id: '09', label: 'ITX-청춘' },
  { id: '10', label: 'KTX-산천B' },
  { id: '16', label: 'KTX-이음' },
  { id: '17', label: 'SRT' },
  { id: '18', label: 'ITX-마음' },
  { id: '19', label: 'KTX-청룡' },
];

export const TIME_OPTIONS = [
  { time: '0500', label: '05:00' },
  { time: '0600', label: '06:00' },
  { time: '0700', label: '07:00' },
  { time: '0800', label: '08:00' },
  { time: '0900', label: '09:00' },
  { time: '1000', label: '10:00' },
  { time: '1100', label: '11:00' },
  { time: '1200', label: '12:00' },
  { time: '1300', label: '13:00' },
  { time: '1400', label: '14:00' },
  { time: '1500', label: '15:00' },
  { time: '1600', label: '16:00' },
  { time: '1700', label: '17:00' },
  { time: '1800', label: '18:00' },
  { time: '1900', label: '19:00' },
  { time: '2000', label: '20:00' },
  { time: '2100', label: '21:00' },
  { time: '2200', label: '22:00' },
  { time: '2300', label: '23:00' },
  { time: '2400', label: '24:00' },
];

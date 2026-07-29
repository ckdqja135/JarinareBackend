/**
 * @role: features/TicketReturn — model
 * @rule: 반환할 승차권 데이터 전역 상태만 담당
 */
import { create } from 'zustand';
import { SeatType } from '@/entities/Seat/types/seatType';
import { SeatsReturnDataStore } from '../types/SeatsReturnDataStore';

export const seatsReturnDataStore = create<SeatsReturnDataStore>((set) => ({
  seatsReturnData: [],
  setSeatsReturnData: (seatsReturnData: SeatType[]) =>
    set(() => ({ seatsReturnData })),
}));

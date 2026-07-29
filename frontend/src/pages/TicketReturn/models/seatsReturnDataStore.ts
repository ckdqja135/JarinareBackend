import { SeatsReturnDataStore } from './../types/seatsReturnDataStore';
import { create } from 'zustand';
import { SeatType } from '@/entities/Seat/types/seatType';

export const seatsReturnDataStore = create<SeatsReturnDataStore>((set) => ({
  seatsReturnData: [],
  setSeatsReturnData: (seatsReturnData: SeatType[]) =>
    set(() => ({ seatsReturnData })),
}));

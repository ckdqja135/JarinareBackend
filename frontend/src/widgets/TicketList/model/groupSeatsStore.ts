import { create } from 'zustand';
import { GroupSeatsStoreType } from '../types/groupSeatsStore';
import { SeatType } from '@/entities/Seat/types/seatType';

export const groupSeatsStore = create<GroupSeatsStoreType>((set) => ({
  groupSeats: [],
  setGroupSeats: (groupSeats: SeatType[]) => set(() => ({ groupSeats })),
}));

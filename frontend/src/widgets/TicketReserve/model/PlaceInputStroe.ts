import { create } from 'zustand';
import {
  CheckStationStoreType,
  PlaceInputStoreType,
} from '../types/PlaceInputType';

export const usePlaceInputStore = create<PlaceInputStoreType>((set) => ({
  isShow: false,
  setIsShow: (isShow: boolean) => set(() => ({ isShow })),
}));

export const useCheckStationStore = create<CheckStationStoreType>((set) => ({
  isValue: '',
  setIsValue: (isValue: string) => set(() => ({ isValue })),
}));

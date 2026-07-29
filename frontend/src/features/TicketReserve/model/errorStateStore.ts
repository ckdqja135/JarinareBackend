import { create } from 'zustand';
import { ErrorStateStoreType } from '../types/errorStateStoreType';

export const errorStateStore = create<ErrorStateStoreType>((set) => ({
  error: '',
  setError: (error: string) => set(() => ({ error })),
}));

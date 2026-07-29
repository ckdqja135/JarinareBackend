import { create } from 'zustand';
import {
  EmailErrorType,
  LoadingStoreType,
  LoginMessageType,
} from '../types/LoginType';

export const LoadingStore = create<LoadingStoreType>((set) => ({
  isLoading: false,
  setIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

export const LoginMessageStore = create<LoginMessageType>((set) => ({
  message: '',
  setMessage: (message: string) => set(() => ({ message })),
}));

export const EmailErrorStore = create<EmailErrorType>((set) => ({
  emailError: '',
  setEmailError: (error: string) => set(() => ({ emailError: error })),
}));

import { create } from 'zustand';
import {
  LoadingStoreType,
  SignUpMessageType,
  EmailErrorType,
  SelectedAgeType,
  SelectedGenderType,
} from '../types/SignUpType';

export const LoadingStore = create<LoadingStoreType>((set) => ({
  isLoading: false,
  setIsLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

export const SignUpMessageStore = create<SignUpMessageType>((set) => ({
  message: '',
  setMessage: (message: string) => set(() => ({ message })),
}));

export const EmailErrorStore = create<EmailErrorType>((set) => ({
  emailError: '',
  setEmailError: (error: string) => set(() => ({ emailError: error })),
}));

export const SelectedAgeStore = create<SelectedAgeType>((set) => ({
  selectedAge: '',
  setSelectedAge: (selectedAge: string) => set(() => ({ selectedAge })),
}));

export const SelectedGenderStore = create<SelectedGenderType>((set) => ({
  selectedGender: '',
  setSelectedGender: (selectedGender: string) =>
    set(() => ({ selectedGender })),
}));

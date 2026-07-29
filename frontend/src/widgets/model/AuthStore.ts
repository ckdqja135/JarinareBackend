import { create } from 'zustand';
import { Store } from '../Auth/types/AuthType';
import { AuthModalTypes } from '@/shared/types/ModalType';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: AuthModalTypes | null) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: AuthModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
  resetModal: () => set(() => ({ isShow: false, modalType: null })),
}));

export default useModalStore;

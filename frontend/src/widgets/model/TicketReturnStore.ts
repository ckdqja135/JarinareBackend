import { create } from 'zustand';
import { Store } from '../TicketReturn/types/TicketReturnType';
import { TicketReturnModalTypes } from '@/shared/types/ModalType';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: TicketReturnModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: TicketReturnModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;

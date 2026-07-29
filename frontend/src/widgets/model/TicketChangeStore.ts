import { create } from 'zustand';
import { Store } from '../TicketChange/types/TicketChangeType';
import { TicketChangeModalTypes } from '@/shared/types/ModalType';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: TicketChangeModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: TicketChangeModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;

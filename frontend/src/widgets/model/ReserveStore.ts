import { create } from 'zustand';
import { Store } from '../TicketReserve/types/ReserveType';
import { ReserveModalTypes } from '@/shared/types/ModalType';

const useReserveModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: ReserveModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: ReserveModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useReserveModalStore;

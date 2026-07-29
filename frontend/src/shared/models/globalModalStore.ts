import { create } from 'zustand';
import { GlobalModalStoreType } from '../types/globalModalStoreType';
import { GolobalModalTypes } from '../types/ModalType';

const globalModalStore = create<GlobalModalStoreType>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: GolobalModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: GolobalModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default globalModalStore;

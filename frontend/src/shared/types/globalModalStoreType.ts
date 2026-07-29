import { GolobalModalTypes } from './ModalType';

export type GlobalModalStoreType = {
  modalType: GolobalModalTypes | null;
  isShow: boolean;
  openModal: (type: GolobalModalTypes) => void;
  closeModal: (type: GolobalModalTypes) => void;
};

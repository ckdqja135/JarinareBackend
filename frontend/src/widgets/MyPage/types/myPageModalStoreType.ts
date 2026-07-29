import { MyPageModalTypes } from '@/shared/types/ModalType';

export type Store = {
  modalType: MyPageModalTypes | null;
  isShow: boolean;
  openModal: (type: MyPageModalTypes) => void;
  closeModal: (type: MyPageModalTypes) => void;
};

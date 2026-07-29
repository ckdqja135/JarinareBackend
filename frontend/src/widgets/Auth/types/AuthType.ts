import { AuthModalTypes } from '@/shared/types/ModalType';

export type Store = {
  modalType: AuthModalTypes | null;
  isShow: boolean;
  openModal: (type: AuthModalTypes | null) => void;
  closeModal: (type: AuthModalTypes) => void;
  resetModal: () => void;
};

export type AuthStageProps = {
  stage?: number;
  width?: number;
  borderRadius?: string;
};

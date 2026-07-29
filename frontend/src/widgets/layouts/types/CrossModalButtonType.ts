import { AuthModalTypes, ReserveModalTypes } from '@/shared/types/ModalType';

export type CrossModalButtonProps = {
  modalType?: AuthModalTypes | ReserveModalTypes | null;
  openModal?: (type: AuthModalTypes | ReserveModalTypes) => void;
  closeModal?: (type: AuthModalTypes | ReserveModalTypes) => void;
  backPage?: () => void;
};

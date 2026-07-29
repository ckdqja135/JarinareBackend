import { AuthModalTypes, ReserveModalTypes } from '@/shared/types/ModalType';

export type BackWardProps = {
  modalType?: AuthModalTypes | ReserveModalTypes | null;
  openModal?: (type: AuthModalTypes | ReserveModalTypes) => void;
  closeModal?: (type: AuthModalTypes | ReserveModalTypes) => void;
  backPage?: () => void;
  title?: string;
  step?: string;
};

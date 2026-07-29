import { AuthModalTypes, ReserveModalTypes } from './ModalType';

export type ButtonProps = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: AuthModalTypes | null;
  onModalClick?: (type: AuthModalTypes | ReserveModalTypes) => void;
  onRefetch?: () => void;
};

export type MiniButtonProp = {
  text: string;
  modalTypes?: ReserveModalTypes | null;
  onModalClick: (type: ReserveModalTypes) => void;
  disabled?: boolean;
};

export type ReserveButtonProps = {
  disabled: boolean;
  bgColor: string;
  textColor: string;
  text: string;
};

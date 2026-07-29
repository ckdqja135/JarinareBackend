import { TicketChangeModalTypes } from '@/shared/types/ModalType';

export type Store = {
  modalType: TicketChangeModalTypes | null;
  isShow: boolean;
  openModal: (type: TicketChangeModalTypes) => void;
  closeModal: (type: TicketChangeModalTypes) => void;
};

export type RequestChangeButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
  className?: string;
};

export type SeatChangeButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};

export type SeatProps = {
  bgColor: string;
  borderColor: string;
  isChangeTarget: boolean;
  onClick?: () => void;
};

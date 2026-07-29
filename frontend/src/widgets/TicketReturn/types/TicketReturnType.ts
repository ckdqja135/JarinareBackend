import { TicketReturnModalTypes } from '@/shared/types/ModalType';
import { SeatType } from '@/entities/Seat/types/seatType';

export type MiniTicketProps = {
  onReturnPC?: (groups: SeatType[]) => void;
};

export type Store = {
  modalType: TicketReturnModalTypes | null;
  isShow: boolean;
  openModal: (type: TicketReturnModalTypes) => void;
  closeModal: (type: TicketReturnModalTypes) => void;
};

export type TicketReturnButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};

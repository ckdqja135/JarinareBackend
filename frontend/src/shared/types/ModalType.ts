export type AuthModalTypes =
  | 'EmailModal'
  | 'NameModal'
  | 'PasswordModal'
  | 'AgeModal';

export type ReserveModalTypes =
  | 'StartPlaceModal'
  | 'EndPlaceModal'
  | 'DayModal'
  | 'ReturnDayModal'
  | 'CountModal'
  | 'TrainChoiceModal'
  | 'TimeChoiceModal'
  | 'ChoiceResultModal'
  | 'TrainNumberChoiceModal'
  | 'PayModal'
  | 'ErrorModal';

export type TicketChangeModalTypes =
  | 'TrainNumberChoiceModal'
  | 'SeatChangeModal'
  | 'RequestChangeModal';

export type TicketReturnModalTypes = 'ReturnModal';

export type MyPageModalTypes = 'DayModal';

export type NotificationModalTypes = 'ResponseModal' | 'AcceptModal';

export type BoardModalTypes = 'noticeModal' | 'EventModal' | 'BoardModal';

export type GolobalModalTypes = 'GlobalModal' | 'ComingSoonModal';

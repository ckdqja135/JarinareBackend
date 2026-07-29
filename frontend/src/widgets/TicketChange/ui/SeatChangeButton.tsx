import { SeatChangeButtonProps } from '../types/TicketChangeType';

const SeatChangeButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: SeatChangeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex h-12 w-[150px] items-center justify-center rounded-xs border border-lightGray text-base font-bold bg-${bgColor} text-${textColor} shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50`}
    >
      {text}
    </button>
  );
};

export default SeatChangeButton;

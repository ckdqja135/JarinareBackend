import { TicketButtonProps } from '../types/TicketType';

const TicketButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: TicketButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[300px] rounded-xs bg-${bgColor} text-base font-bold text-${textColor} border border-lightGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95`}
    >
      {text}
    </button>
  );
};

export default TicketButton;

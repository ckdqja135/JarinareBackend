import { RequestChangeButtonProps } from '../types/TicketChangeType';

const RequestChangeButton = ({
  text,
  bgColor,
  textColor,
  onClick,
  className = '',
}: RequestChangeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`border border-lightGray text-base font-bold active:brightness-95 bg-${bgColor} text-${textColor} ${className}`}
    >
      {text}
    </button>
  );
};

export default RequestChangeButton;

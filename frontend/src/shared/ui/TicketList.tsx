import { TicketListProps } from '../types/TicketType';

const TicketList = ({ title, text, textColor }: TicketListProps) => {
  return (
    <div className="flex justify-between text-sm font-bold">
      <span className="text-mediumGray">{title}</span>
      <span className={`text-${textColor}`}>{text}</span>
    </div>
  );
};

export default TicketList;

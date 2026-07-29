import { SeatProps } from '../types/TicketChangeType';

const Seat = ({ borderColor, bgColor, isChangeTarget, onClick }: SeatProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-${bgColor} border border-${borderColor} h-[40px] w-[40px] rounded-xs ${isChangeTarget ? 'animate-pulse' : null}`}
    />
  );
};

export default Seat;

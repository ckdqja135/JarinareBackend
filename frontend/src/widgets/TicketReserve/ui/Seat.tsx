import { SeatProps } from '../types/ReserveType';

const Seat = ({ borderColor, bgColor, onClick }: SeatProps) => {
  return (
    <div
      onClick={onClick!}
      className={`bg-${bgColor} border border-${borderColor} h-[40px] w-[40px] cursor-pointer rounded-xs`}
    />
  );
};

export default Seat;

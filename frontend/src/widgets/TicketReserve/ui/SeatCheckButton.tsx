import { SeatCheckButtonProps } from '../types/ReserveType';

const SeatCheckButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: SeatCheckButtonProps) => {
  return (
    <button
      onClick={onClick!}
      className={`flex h-12 w-[150px] items-center justify-center rounded-xs border border-lightGray text-base font-bold shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50 bg-${bgColor} text-${textColor}`}
    >
      {text}
    </button>
  );
};

export default SeatCheckButton;

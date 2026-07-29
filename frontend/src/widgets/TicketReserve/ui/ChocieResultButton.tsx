import { ChocieResultButtonProps } from '../types/ReserveType';

const ChocieResultButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: ChocieResultButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-[140px] rounded-sm bg-${bgColor} text-${textColor} border border-lightGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95`}
    >
      {text}
    </button>
  );
};

export default ChocieResultButton;

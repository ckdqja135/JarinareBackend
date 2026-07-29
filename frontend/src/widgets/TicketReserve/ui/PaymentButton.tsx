import { PaymnetButtonProps } from '../types/ReserveType';

const PaymentButton = ({
  text,
  bgColor,
  textColor,
  onClick,
}: PaymnetButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex h-12 w-[150px] items-center justify-center rounded-xs border border-lightGray text-base font-bold active:brightness-50 bg-${bgColor} text-${textColor} shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95`}
    >
      {text}
    </button>
  );
};

export default PaymentButton;

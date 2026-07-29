import { ButtonProps } from '../types/ButtonType';

const Button = ({
  modalTypes,
  text,
  textColor,
  bgColor,
  icon,
  onModalClick,
}: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => {
        onModalClick!(modalTypes!);
      }}
      className={`relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray text-base font-bold shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50 lg:w-full text-${textColor} bg-${bgColor}`}
    >
      {icon ? (
        <img
          className="absolute left-[20px]"
          width={20}
          height={20}
          src={icon}
        />
      ) : null}
      {text}
    </button>
  );
};

export default Button;

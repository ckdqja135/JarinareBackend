import useModalStore from '@/widgets/model/AuthStore';
import { ButtonProps } from '@/shared/types/ButtonType';

const NextButton = ({ bgColor, textColor, text, modalTypes }: ButtonProps) => {
  const { openModal } = useModalStore();
  return (
    <div className="mb-[45px] flex flex-col">
      <button
        type="button"
        onClick={() => openModal(modalTypes!)}
        className={`relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-${bgColor} text-base font-bold text-${textColor} shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50`}
      >
        {text}
      </button>
    </div>
  );
};

export default NextButton;

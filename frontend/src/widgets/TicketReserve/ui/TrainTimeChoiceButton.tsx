import { MiniButtonProp } from '@/shared/types/ButtonType';

const TrainTimeChocieButton = ({
  text,
  modalTypes,
  onModalClick,
  disabled,
}: MiniButtonProp) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        onModalClick(modalTypes!);
      }}
      className={`flex h-[30px] w-[50px] items-center justify-center rounded-sm border ${disabled ? 'border-gray-300 bg-gray-200' : 'border-blue bg-blue active:brightness-95'} shadow-sm transition-all`}
    >
      <span
        className={`text-sm font-bold ${disabled ? '' : 'text-white'}`}
        style={disabled ? { color: '#EA433580' } : undefined}
      >
        {disabled ? '매진' : text}
      </span>
    </button>
  );
};

export default TrainTimeChocieButton;

import backward from '@/assets/icons/backward.png';
import { BackWardProps } from '../types/BackWardType';

const BackWardModalButton = ({
  modalType,
  openModal,
  closeModal,
  title,
  step,
}: BackWardProps) => {
  return (
    <div className="mt-[30px] flex w-full items-center">
      <img
        onClick={() => {
          closeModal?.(modalType!);
          openModal?.(modalType!);
        }}
        src={backward}
        className="h-[20px] w-[12px] cursor-pointer"
      />
      {title && (
        <span className="ml-3 text-lg font-bold text-black">{title}</span>
      )}
      {step && (
        <span className="ml-auto rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-darkGray">
          {step}
        </span>
      )}
    </div>
  );
};

export default BackWardModalButton;

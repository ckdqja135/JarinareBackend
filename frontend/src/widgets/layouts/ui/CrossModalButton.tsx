import cross from '@/assets/icons/cross.png';

import { CrossModalButtonProps } from '../types/CrossModalButtonType';

const CrossModalButton = ({
  modalType,
  openModal,
  closeModal,
}: CrossModalButtonProps) => {
  return (
    <div className="flex w-full justify-end">
      <img
        onClick={() => {
          closeModal?.(modalType!);
          openModal?.(modalType!);
        }}
        src={cross}
        className="h-[20px] w-[20px] cursor-pointer"
      />
    </div>
  );
};

export default CrossModalButton;

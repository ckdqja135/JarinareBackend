/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import plus from '@/assets/icons/plus.png';
import minus from '@/assets/icons/minus.png';
import { useCountKidButton } from '../hooks/useCountKidButton';

export const CountKidButton = () => {
  const { kid, handleDecrease, handleIncrease } = useCountKidButton();
  return (
    <div className="flex h-[30px] w-[100px] items-center justify-between">
      <div
        onClick={handleDecrease}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:bg-gray-50 active:brightness-95"
      >
        <img src={minus} width={10} />
      </div>
      <span>{kid}</span>
      <div
        onClick={handleIncrease}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:bg-gray-50 active:brightness-95"
      >
        <img src={plus} width={10} />
      </div>
    </div>
  );
};

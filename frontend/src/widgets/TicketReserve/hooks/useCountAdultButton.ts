/**
 * @role: widgets/TicketReserve — hooks
 * @rule: CountAdultButton 상태·이벤트 핸들러만 담당, UI 포함 금지
 */
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const useCountAdultButton = () => {
  const { adult, setAdult } = trainDataStore();

  const handleDecrease = () => setAdult(adult <= 0 ? 0 : adult - 1);
  const handleIncrease = () => setAdult(adult + 1);

  return { adult: adult < 0 ? 0 : adult, handleDecrease, handleIncrease };
};

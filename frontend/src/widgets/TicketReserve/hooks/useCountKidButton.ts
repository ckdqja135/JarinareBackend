/**
 * @role: widgets/TicketReserve — hooks
 * @rule: CountKidButton 상태·이벤트 핸들러만 담당, UI 포함 금지
 */
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const useCountKidButton = () => {
  const { kid, setKid } = trainDataStore();

  const handleDecrease = () => setKid(kid <= 0 ? 0 : kid - 1);
  const handleIncrease = () => setKid(kid + 1);

  return { kid: kid < 0 ? 0 : kid, handleDecrease, handleIncrease };
};

/**
 * @role: widgets/TicketReturn — hooks
 * @rule: PCTicketReturnModal 데이터·핸들러만 담당, UI 포함 금지
 */
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import { useTicketReturn } from '@/features/TicketReturn/hooks/useTicketReturn';
import useModalStore from '@/widgets/model/TicketReturnStore';
import { formatTimeView } from '@/shared/lib/formatDate';

const calcDuration = (start: number, end: number) => {
  const sh = parseInt(String(start).substring(8, 10));
  const sm = parseInt(String(start).substring(10, 12));
  const eh = parseInt(String(end).substring(8, 10));
  const em = parseInt(String(end).substring(10, 12));
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  if (diff >= 60)
    return `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ''}`;
  return `${diff}분`;
};

export const usePCTicketReturnModal = () => {
  const { seatsReturnData } = seatsReturnDataStore();
  const { handleDeleteSeats } = useTicketReturn();
  const { closeModal } = useModalStore();

  const seat = seatsReturnData[0];

  const trainTypeName = seat
    ? (() => {
        const parts = seat.trainType.split('-');
        const first = parts[0];
        const namePart = parts[1]?.split('(')[0] ?? '';
        return namePart ? `${first} ${namePart}` : first;
      })()
    : '';

  const passengerText = seat
    ? [
        seat.selectAdult > 0 ? `어른 ${seat.selectAdult}명` : '',
        seat.selectKid > 0 ? `어린이 ${seat.selectKid}명` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const handleClose = () => closeModal('ReturnModal');

  const handleConfirm = async () => {
    await handleDeleteSeats();
    closeModal('ReturnModal');
  };

  return {
    seat,
    trainTypeName,
    startTime: seat ? formatTimeView(String(seat.startTime)) : '',
    endTime: seat ? formatTimeView(String(seat.endTime)) : '',
    duration: seat ? calcDuration(seat.startTime, seat.endTime) : '',
    passengerText,
    handleClose,
    handleConfirm,
  };
};

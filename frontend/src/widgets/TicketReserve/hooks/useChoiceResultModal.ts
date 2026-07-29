/**
 * @role: widgets/TicketReserve — hooks
 * @rule: ChoiceResultModal 상태·로직만 담당, UI 포함 금지
 */
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';
import { useNavigation } from './ReserveHook';
import { formatTimeView } from '@/shared/lib/formatDate';
import { formatTrainGradeName } from '@/shared/lib/formatTrainName';

const calcDuration = (start: number, end: number) => {
  const depH = Number(String(start).substring(8, 10));
  const depM = Number(String(start).substring(10, 12));
  const arrH = Number(String(end).substring(8, 10));
  const arrM = Number(String(end).substring(10, 12));
  let diff = arrH * 60 + arrM - (depH * 60 + depM);
  if (diff < 0) diff += 24 * 60;
  return diff >= 60
    ? `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ''}`
    : `${diff}분`;
};

export const useChoiceResultModal = () => {
  const { closeModal } = useModalStore();
  const { navigate } = useNavigation();
  const {
    selectStartTime,
    selectEndTime,
    selectTrainType,
    selectKid,
    selectAdult,
    selectPay,
  } = trainDataStore();

  const parts = selectTrainType.split('-');
  const trainno = parts[parts.length - 1];
  const gradePart = parts.slice(0, -1).join('-');
  const trainTypeDisplay = `${formatTrainGradeName(gradePart)}-${trainno}`;

  const startTimeView = formatTimeView(String(selectStartTime));
  const endTimeView = formatTimeView(String(selectEndTime));
  const durationText = calcDuration(selectStartTime, selectEndTime);

  const handleClose = () => closeModal('ChoiceResultModal');
  const handleConfirm = () => {
    closeModal('ChoiceResultModal');
    navigate('/reserve/seatcheck');
  };

  return {
    startTimeView,
    endTimeView,
    durationText,
    trainTypeDisplay,
    selectKid,
    selectAdult,
    selectPay,
    handleClose,
    handleConfirm,
  };
};

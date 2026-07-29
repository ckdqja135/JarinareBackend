/**
 * @role: widgets/TicketReserve — ui
 * @rule: 모달 타입 분기 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import useModalStore from '@/widgets/model/ReserveStore';
import StartPlaceModal from './StartPlaceModal';
import EndPlaceModal from './EndPlaceModal';
import DayModal from './DayModal';
import ReturnDayModal from './ReturnDayModal';
import CountModal from './CountModal';
import TrainChoiceModal from './TrainChoiceModal';
import TimeChoiceModal from './TimeChoiceModal';
import ChoiceResultModal from './ChoiceResultModal';
import TrainNumberChoiceModal from './TrainNumberChocieModal';
import PayModal from './PayModal';
import ErrorModal from './ErrorModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();

  return (
    <div className="fixed left-1/2 top-0 z-[60] h-screen w-[375px] -translate-x-1/2 lg:left-[220px] lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-[calc(100%-220px)] lg:translate-x-0">
      {isShow == true && modalType == 'StartPlaceModal' ? (
        <StartPlaceModal />
      ) : null}
      {isShow == true && modalType == 'EndPlaceModal' ? (
        <EndPlaceModal />
      ) : null}
      {isShow == true && modalType == 'DayModal' ? <DayModal /> : null}
      {isShow == true && modalType == 'ReturnDayModal' ? (
        <ReturnDayModal />
      ) : null}
      {isShow == true && modalType == 'CountModal' ? <CountModal /> : null}
      {isShow == true && modalType == 'TrainChoiceModal' ? (
        <TrainChoiceModal />
      ) : null}
      {isShow == true && modalType == 'TimeChoiceModal' ? (
        <TimeChoiceModal />
      ) : null}
      {isShow == true && modalType == 'ChoiceResultModal' ? (
        <ChoiceResultModal />
      ) : null}
      {isShow == true && modalType == 'TrainNumberChoiceModal' ? (
        <TrainNumberChoiceModal />
      ) : null}
      {isShow == true && modalType == 'PayModal' ? <PayModal /> : null}
      {isShow == true && modalType == 'ErrorModal' ? <ErrorModal /> : null}
    </div>
  );
};

export default Modal;

/**
 * @role: widgets — 좌석변경 모달 라우터
 * @rule: 모달 상태에 따라 컴포넌트만 분기, 비즈니스 로직 포함 금지
 */
import useModalStore from '@/widgets/model/TicketChangeStore';
import TrainNumberChoiceModal from './TrainNumberChocieModal';
import SeatChangeModal from './SeatChangeModal';
import RequestChangeModal from './RequestChangeModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed z-50 mx-auto my-0 h-screen w-[375px] lg:absolute lg:inset-0 lg:h-full lg:w-full">
      {isShow == true && modalType == 'TrainNumberChoiceModal' ? (
        <TrainNumberChoiceModal />
      ) : null}
      {isShow == true && modalType == 'SeatChangeModal' ? (
        <SeatChangeModal />
      ) : null}
      {isShow == true && modalType == 'RequestChangeModal' ? (
        <RequestChangeModal />
      ) : null}
    </div>
  );
};

export default Modal;

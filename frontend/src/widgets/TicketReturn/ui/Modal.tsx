/**
 * @role: widgets/TicketReturn — ui
 * @rule: 렌더링만 담당, 모바일/PC 모달 분기 처리
 */
import useModalStore from '@/widgets/model/TicketReturnStore';
import TicketReturnModal from './TicketReturnModal';
import PCTicketReturnModal from './PCTicketReturnModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();

  if (!isShow || modalType !== 'ReturnModal') return null;

  return (
    <>
      {/* 모바일 */}
      <div className="fixed mx-auto my-0 h-screen w-[375px] lg:hidden">
        <TicketReturnModal />
      </div>
      {/* PC */}
      <PCTicketReturnModal />
    </>
  );
};

export default Modal;

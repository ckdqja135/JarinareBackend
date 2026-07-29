import useModalStore from '@/widgets/model/MyaPageStore';
import DayModal from './DayModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType == 'DayModal' ? <DayModal /> : null}
    </div>
  );
};

export default Modal;

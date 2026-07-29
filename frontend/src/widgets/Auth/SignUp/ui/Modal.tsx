/**
 * @role: widget
 * @rule: 레이아웃 없음 — 컨테이너 크기는 부모가 제어
 */
import useModalStore from '@/widgets/model/AuthStore';
import PasswordModal from './PasswordModal';
import NameModal from './NameModal';
import AgeModal from './AgeModal';
const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <>
      {isShow && modalType === 'NameModal' && <NameModal />}
      {isShow && modalType === 'AgeModal' && <AgeModal />}
      {isShow && modalType === 'PasswordModal' && <PasswordModal />}
    </>
  );
};

export default Modal;

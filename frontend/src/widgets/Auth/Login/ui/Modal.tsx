/**
 * @role: widget
 * @rule: 레이아웃 없음 — 컨테이너 크기는 부모가 제어
 */
import useModalStore from '@/widgets/model/AuthStore';
import EmailModal from './EmaiModal';
import PasswordModal from './PasswordModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <>
      {isShow && modalType === 'EmailModal' && <EmailModal />}
      {isShow && modalType === 'PasswordModal' && <PasswordModal />}
    </>
  );
};

export default Modal;

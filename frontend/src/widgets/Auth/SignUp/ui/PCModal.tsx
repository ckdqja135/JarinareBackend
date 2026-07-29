/**
 * @role: widget
 * @rule: PC 전용 — 모달 타입에 따라 단계별 컴포넌트 렌더링
 */
import useModalStore from '@/widgets/model/AuthStore';
import PCEmailStep from './PCEmailStep';
import PCNameStep from './PCNameStep';
import PCAgeStep from './PCAgeStep';
import PCPasswordStep from './PCPasswordStep';

const PCModal = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <>
      {!isShow && <PCEmailStep />}
      {isShow && modalType === 'NameModal' && <PCNameStep />}
      {isShow && modalType === 'AgeModal' && <PCAgeStep />}
      {isShow && modalType === 'PasswordModal' && <PCPasswordStep />}
    </>
  );
};

export default PCModal;

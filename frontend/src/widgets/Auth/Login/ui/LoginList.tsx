import Button from '@/shared/ui/Button';
import useModalStore from '@/widgets/model/AuthStore';

const LoginList = () => {
  const { openModal } = useModalStore();
  return (
    <Button
      text="이메일로 로그인"
      bgColor="blue"
      textColor="white"
      onModalClick={() => openModal('EmailModal')}
    />
  );
};

export default LoginList;

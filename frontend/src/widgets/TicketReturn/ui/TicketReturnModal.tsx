import { useTicketReturn } from '@/features/TicketReturn/hooks/useTicketReturn';
import useModalStore from '../../model/TicketReturnStore';
import TicketReturnButton from './TickeReturnButton';

const TicketReturnModal = () => {
  const { closeModal } = useModalStore();
  const { handleDeleteSeats } = useTicketReturn();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[200px] w-[260px] flex-col items-center rounded-2xl bg-white px-[20px] pt-[55px] font-bold">
        <span className="flex w-full justify-center text-base">
          정말 예매를 취소할까요?
        </span>
        <div className="mt-[60px] flex w-full justify-between text-base">
          <TicketReturnButton
            text="취소"
            bgColor="lightBlue"
            textColor="blue"
            onClick={() => closeModal('ReturnModal')}
          />
          <TicketReturnButton
            text="확인"
            bgColor="blue"
            textColor="white"
            onClick={() => {
              handleDeleteSeats();
              closeModal('ReturnModal');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketReturnModal;

import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';
import useReserveModalStore from '@/widgets/model/ReserveStore';
import warning from '@/assets/icons/warning.png';

const ErrorModal = () => {
  const { closeModal } = useReserveModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[200px] w-[280px] flex-col items-center rounded-2xl bg-white px-[20px] pt-[20px] font-bold">
        <div className="w-full">
          <CrossModalButton closeModal={() => closeModal('ErrorModal')} />
        </div>
        <img src={warning} width={40} height={40} />

        <span className="mt-5 flex w-full justify-center text-center text-base">
          현재 서비스가 일시적으로 중단되었습니다.
          <br />
          불편을 드려 죄송합니다.
        </span>
      </div>
    </div>
  );
};

export default ErrorModal;

import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/TicketChangeStore';
import { reserveConstants } from '@/widgets/TicketReserve/constants/ReserveConstants';

const TrainNumberChoiceModal = () => {
  const { closeModal } = useModalStore();
  const { trainNoArray } = reserveConstants();
  const { setTrainNo } = trainDataStore();
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('TrainNumberChoiceModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-4 text-base font-bold text-gray-800">호차 선택</p>

        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: '320px' }}>
          {trainNoArray.map(({ trainNoView, trainNo, icon }, idx) => (
            <div
              key={idx}
              onClick={async () => {
                setTrainNo(trainNo);
                closeModal('TrainNumberChoiceModal');
              }}
              className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 active:bg-gray-50"
            >
              <span className="text-sm font-semibold text-gray-700">
                {trainNo}호차 잔여&nbsp;
                <span className="text-blue">{trainNoView}</span>석/24석
              </span>
              <img className="opacity-0 active:opacity-100" src={icon} width={15} height={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainNumberChoiceModal;

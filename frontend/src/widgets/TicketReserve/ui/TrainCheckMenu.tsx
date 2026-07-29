import down from '@/assets/icons/down.png';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';

const TrainCheckMenu = () => {
  const { openModal } = useModalStore();
  const { trainTypeForView, startTimeForView } = trainDataStore();
  return (
    <div className="mt-4 flex w-full gap-3">
      <div
        onClick={() => openModal('TrainChoiceModal')}
        className="flex flex-1 cursor-pointer items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm active:brightness-95"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400">기차 종류</span>
          <span className="text-sm font-bold text-gray-800">
            {trainTypeForView ? trainTypeForView : '전체'}
          </span>
        </div>
        <img src={down} width={11} height={7} />
      </div>
      <div
        onClick={() => openModal('TimeChoiceModal')}
        className="flex flex-1 cursor-pointer items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm active:brightness-95"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400">시간대</span>
          <span className="text-sm font-bold text-gray-800">
            {startTimeForView ? `${startTimeForView.substring(0, 2)}시 이후` : '전체'}
          </span>
        </div>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default TrainCheckMenu;

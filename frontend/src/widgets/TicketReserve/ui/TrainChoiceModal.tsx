import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import check from '@/assets/icons/check.png';

const TrainChoiceModal = () => {
  const { closeModal } = useModalStore();
  const { trainArray } = reserveConstants();
  const { setTrainType, setTrainTypeForView, trainType } = trainDataStore();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('TrainChoiceModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-4 text-base font-bold text-gray-800">기차 선택</p>

        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: '320px' }}>
          {trainArray.map(({ train, id }, idx) => {
            const isSelected = trainType === id;
            return (
              <div
                key={idx}
                onClick={async () => {
                  await setTrainType(id);
                  setTrainTypeForView(train);
                  closeModal('TrainChoiceModal');
                }}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                  isSelected ? 'bg-lightBlue' : 'active:bg-gray-50'
                }`}
              >
                <span className={`text-sm font-semibold ${isSelected ? 'text-blue' : 'text-gray-700'}`}>
                  {train}
                </span>
                {isSelected && <img src={check} width={15} height={11} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainChoiceModal;

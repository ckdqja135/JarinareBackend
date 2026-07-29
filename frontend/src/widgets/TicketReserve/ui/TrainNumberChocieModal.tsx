import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';

const TOTAL_SEATS = 24;

const getCongestion = (reserved: number) => {
  if (reserved === 0) return { label: '여유', bg: '#dcfce7', color: '#16a34a' };
  const ratio = reserved / TOTAL_SEATS;
  if (ratio < 0.3) return { label: '여유', bg: '#dcfce7', color: '#16a34a' };
  if (ratio < 0.7) return { label: '보통', bg: '#fef9c3', color: '#ca8a04' };
  return { label: '혼잡', bg: '#fee2e2', color: '#ef4444' };
};

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
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-4 text-base font-bold text-gray-800">호차 선택</p>

        <div
          className="flex flex-col overflow-y-auto"
          style={{ maxHeight: '320px' }}
        >
          {trainNoArray.map(({ trainNoView, trainNo }, idx) => {
            const reserved = Number(trainNoView);
            const { label, bg, color } = getCongestion(reserved);
            return (
              <div
                key={idx}
                onClick={() => {
                  setTrainNo(trainNo);
                  closeModal('TrainNumberChoiceModal');
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 active:bg-gray-50"
              >
                <span className="text-sm font-semibold text-gray-700">
                  {trainNo}호차 잔여&nbsp;
                  <span className="text-blue">{trainNoView}</span>석/24석
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: bg, color }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainNumberChoiceModal;

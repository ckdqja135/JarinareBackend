import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import { formatDate, formatTime } from '@/shared/lib/formatDate';

const TimeChoiceModal = () => {
  const { closeModal } = useModalStore();
  const { timeArray } = reserveConstants();
  const { setStartTime, setStartTimeForView, startDay, startTimeForView } = trainDataStore();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('TimeChoiceModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-4 text-base font-bold text-gray-800">시간 선택</p>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => {
              setStartTime('0000');
              setStartTimeForView('');
              closeModal('TimeChoiceModal');
            }}
            className={`col-span-4 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
              startTimeForView === ''
                ? 'bg-blue text-white'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            }`}
          >
            전체
          </button>
          {timeArray.map(({ timeView, time }, idx) => {
            const isPast = startDay === formatDate(new Date()) && time <= formatTime();
            const isSelected = startTimeForView === timeView;

            return (
              <button
                key={idx}
                disabled={isPast}
                onClick={() => {
                  setStartTime(time);
                  setStartTimeForView(timeView);
                  closeModal('TimeChoiceModal');
                }}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  isPast
                    ? 'bg-gray-50 text-gray-300'
                    : isSelected
                      ? 'bg-blue text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}
              >
                {timeView}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => closeModal('TimeChoiceModal')}
          className="mt-5 w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white"
        >
          선택
        </button>
      </div>
    </div>
  );
};

export default TimeChoiceModal;

import { reserveConstants } from '../constants/ReserveConstants';
import useModalStore from '@/widgets/model/ReserveStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import ReserveButton from './ReserveButton';
import { useState } from 'react';
import calendar from '@/assets/icons/calendar.png';

const SwapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
    <path
      d="M7 4v16M7 4L4 7M7 4l3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 20V4M17 20l-3-3M17 20l3-3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReserveWay = () => {
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const { openModal } = useModalStore();
  const {
    startStationForView,
    endStationForView,
    startDayForView,
    endDayForView,
    kid,
    adult,
    setStartStation,
    setEndStation,
    setStartStationForView,
    setEndStationForView,
  } = trainDataStore();
  const { reserveWayArray } = reserveConstants();

  const stationItems = reserveWayArray.slice(0, 2);
  const dayItem = reserveWayArray[2];
  const countItem = reserveWayArray[3];

  const handleSwap = () => {
    const prevStart = startStationForView;
    const prevEnd = endStationForView;
    const storeSnap = trainDataStore.getState();
    setStartStation(storeSnap.endStation);
    setEndStation(storeSnap.startStation);
    setStartStationForView(prevEnd);
    setEndStationForView(prevStart);
  };

  const valueMap: Record<string, string> = {
    StartPlaceModal: startStationForView,
    EndPlaceModal: endStationForView,
    DayModal: startDayForView,
    CountModal: adult + kid > 0 ? `${adult + kid}명` : '',
  };

  return (
    <div className="flex w-full flex-col gap-y-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
      {/* 승차권 예매 / 왕복 */}
      <div className="flex items-center justify-between">
        <span className="ml-[15px] text-base font-bold text-gray-800">
          승차권 예매
        </span>
        <button
          type="button"
          onClick={() => setIsRoundTrip((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
            isRoundTrip
              ? 'border-blue bg-blue text-white'
              : 'border-gray-300 bg-white text-gray-400'
          }`}
        >
          왕복
        </button>
      </div>

      {/* 구분선 */}
      <div className="h-[1px] w-full bg-gray-100" />

      {/* 출발지 / 스왑 / 도착지 */}
      <div className="relative flex flex-col gap-y-2">
        {stationItems.map(({ icon, attribute, modalType }, idx) => {
          const value = valueMap[modalType];
          const isEmpty = !value;
          return (
            <button
              key={idx}
              onClick={() => openModal(modalType)}
              className="flex h-[52px] w-full items-center gap-x-3 rounded-2xl bg-gray-100 px-3 shadow-sm transition-all active:brightness-95"
            >
              <img width={20} height={20} src={icon} />
              <div className="flex flex-col items-start">
                <span className="text-xs text-mediumGray">{attribute}</span>
                <span
                  className={`text-base font-bold ${isEmpty ? 'text-mediumGray' : 'text-black'}`}
                >
                  {isEmpty ? `${attribute}를 선택하세요` : value}
                </span>
              </div>
            </button>
          );
        })}
        {/* 스왑 버튼 */}
        <button
          onClick={handleSwap}
          className="absolute right-3 top-1/2 flex h-[32px] w-[32px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-darkGray shadow-md transition-all active:brightness-95"
        >
          <SwapIcon />
        </button>
      </div>

      {/* 가는날 + (오는날 or 인원) */}
      <div className="flex gap-x-2">
        {/* 가는날 */}
        <button
          onClick={() => openModal(dayItem.modalType)}
          className="flex h-[52px] flex-1 items-center gap-x-2 rounded-2xl bg-gray-100 px-3 shadow-sm transition-all active:brightness-95"
        >
          <img width={18} height={18} src={dayItem.icon} />
          <div className="flex flex-col items-start">
            <span className="text-xs text-mediumGray">{dayItem.attribute}</span>
            <span
              className={`text-sm font-bold ${!startDayForView ? 'text-mediumGray' : 'text-black'}`}
            >
              {startDayForView || '선택'}
            </span>
          </div>
        </button>

        {/* 왕복: 오는날 / 편도: 인원 */}
        {isRoundTrip ? (
          <button
            onClick={() => openModal('ReturnDayModal')}
            className="flex h-[52px] flex-1 items-center gap-x-2 rounded-2xl bg-gray-100 px-3 shadow-sm transition-all active:brightness-95"
          >
            <img width={18} height={18} src={calendar} />
            <div className="flex flex-col items-start">
              <span className="text-xs text-mediumGray">오는날</span>
              <span
                className={`text-sm font-bold ${!endDayForView ? 'text-mediumGray' : 'text-black'}`}
              >
                {endDayForView || '선택'}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => openModal(countItem.modalType)}
            className="flex h-[52px] flex-1 items-center gap-x-2 rounded-2xl bg-gray-100 px-3 shadow-sm transition-all active:brightness-95"
          >
            <img width={18} height={18} src={countItem.icon} />
            <div className="flex flex-col items-start">
              <span className="text-xs text-mediumGray">
                {countItem.attribute}
              </span>
              <span
                className={`text-sm font-bold ${adult + kid === 0 ? 'text-mediumGray' : 'text-black'}`}
              >
                {adult + kid > 0 ? `${adult + kid}명` : '선택'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* 왕복일 때만 인원 단독 행 */}
      {isRoundTrip && (
        <button
          onClick={() => openModal(countItem.modalType)}
          className="flex h-[52px] w-full items-center gap-x-2 rounded-2xl bg-gray-100 px-3 shadow-sm transition-all active:brightness-95"
        >
          <img width={18} height={18} src={countItem.icon} />
          <div className="flex flex-col items-start">
            <span className="text-xs text-mediumGray">
              {countItem.attribute}
            </span>
            <span
              className={`text-sm font-bold ${adult + kid === 0 ? 'text-mediumGray' : 'text-black'}`}
            >
              {adult + kid > 0 ? `${adult + kid}명` : '선택'}
            </span>
          </div>
        </button>
      )}

      {/* 조회 버튼 */}
      <ReserveButton
        disabled={
          startStationForView === '' ||
          endStationForView === '' ||
          startDayForView === '' ||
          adult + kid === 0
        }
        text="조회"
        textColor="white"
        bgColor="blue"
      />
    </div>
  );
};

export default ReserveWay;

/**
 * @role: pages — PC 열차 조회 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import PCSkeletonScreen from '@/widgets/layouts/ui/PCSkeletonScreen';
import { formatTimeView } from '@/shared/lib/formatDate';
import { usePCTrainCheckPage } from '../hooks/usePCTrainCheckPage';
import {
  DAYS_KO,
  TRAIN_OPTIONS,
  TIME_OPTIONS,
} from '../constants/PCTrainCheckConstants';
import down from '@/assets/icons/down.png';

const PCTrainCheckPage = () => {
  const {
    isFetching,
    trains,
    startStationForView,
    endStationForView,
    trainTypeForView,
    startTimeForView,
    adult,
    kid,
    weekDaysWithSelection,
    selectedDate,
    openDropdown,
    handleSelectDate,
    handleToggleDropdown,
    handleCloseDropdown,
    handleSelectTrainType,
    handleSelectTime,
    handleSelectTrain,
    handleBack,
  } = usePCTrainCheckPage();

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-gray-50"
      onClick={handleCloseDropdown}
    >
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-32 pb-16 pt-10">
            {/* 메인 카드 */}
            <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* 카드 제목 */}
              <div className="px-6 pb-2 pt-5">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="12" x2="4" y2="12" />
                    <polyline points="10 18 4 12 10 6" />
                  </svg>
                  열차 조회
                </button>
              </div>

              {/* 상단: 날짜 + 필터 */}
              <div className="flex gap-12 border-b border-gray-100 px-8 py-7">
                {/* 왼쪽: 날짜 + 7일 캘린더 */}
                <div className="flex flex-1 flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">출발 날짜</span>
                    <span className="text-2xl font-semibold text-black">
                      {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                      ({DAYS_KO[selectedDate.getDay()]})
                    </span>
                    <span className="text-xs text-gray-400">
                      {startStationForView} → {endStationForView}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {weekDaysWithSelection.map(({ date, dow, isSelected }) => (
                      <div
                        key={date.toISOString()}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className={`text-[10px] font-semibold ${dow === 0 ? 'text-red' : dow === 6 ? 'text-blue' : 'text-gray-400'}`}
                        >
                          {DAYS_KO[dow]}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDate(date);
                          }}
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-blue' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                          <span
                            className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}
                          >
                            {date.getDate()}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 오른쪽: 기차종류 + 시간대 드롭다운 */}
                <div className="flex flex-row items-end gap-3">
                  {/* 기차 종류 드롭다운 */}
                  <div
                    className="flex flex-col gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs font-semibold text-gray-500">
                      기차 종류
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => handleToggleDropdown('train')}
                        className="flex w-48 items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100"
                      >
                        <span className="text-sm font-bold text-gray-800">
                          {trainTypeForView || '전체'}
                        </span>
                        <img src={down} width={11} height={7} />
                      </button>
                      {openDropdown === 'train' && (
                        <div className="absolute right-0 top-full z-10 mt-1 max-h-52 w-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                          <button
                            onClick={() => handleSelectTrainType('', '')}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50"
                          >
                            전체
                          </button>
                          {TRAIN_OPTIONS.map(({ id, label }) => (
                            <button
                              key={id}
                              onClick={() => handleSelectTrainType(id, label)}
                              className={`w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50 ${trainTypeForView === label ? 'text-blue' : 'text-gray-800'}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 시간대 드롭다운 */}
                  <div
                    className="flex flex-col gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs font-semibold text-gray-500">
                      시간대
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => handleToggleDropdown('time')}
                        className="flex w-48 items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100"
                      >
                        <span className="text-sm font-bold text-gray-800">
                          {startTimeForView
                            ? `${startTimeForView.substring(0, 2)}시 이후`
                            : '전체'}
                        </span>
                        <img src={down} width={11} height={7} />
                      </button>
                      {openDropdown === 'time' && (
                        <div className="absolute right-0 top-full z-10 mt-1 max-h-52 w-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                          <button
                            onClick={() => handleSelectTime('0000', '')}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50"
                          >
                            전체
                          </button>
                          {TIME_OPTIONS.map(({ time, label }) => (
                            <button
                              key={time}
                              onClick={() => handleSelectTime(time, label)}
                              className={`w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50 ${startTimeForView === label ? 'text-blue' : 'text-gray-800'}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단: 열차 선택 */}
              <div className="flex flex-col bg-gray-50 px-6 py-5">
                {isFetching ? (
                  <PCSkeletonScreen />
                ) : trains.length === 0 ? (
                  <div className="flex h-32 items-center justify-center">
                    <span className="text-sm text-gray-400">
                      조회된 열차 목록이 없어요.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {trains.map(
                      (
                        {
                          depplandtime,
                          arrplandtime,
                          traingradename,
                          adultcharge,
                          trainno,
                          durationText,
                          isSoldOut,
                          remainingSeats,
                          cardStyle,
                          trainGradeDisplay,
                        },
                        idx,
                      ) => (
                        <div
                          key={idx}
                          className={`flex rounded-xl border transition-shadow ${cardStyle}`}
                        >
                          {/* 시간 구간 (9/10) */}
                          <div className="flex flex-[9] flex-col gap-3 p-5">
                            {/* 열차 종류 + 좌석 상태 */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 text-xs font-bold ${isSoldOut ? 'bg-gray-200 text-gray-400' : 'bg-lightBlue text-blue'}`}
                              >
                                {trainGradeDisplay}-{trainno}
                              </span>
                              <span
                                className={`text-xs font-semibold ${isSoldOut ? 'text-red' : 'text-gray-400'}`}
                              >
                                {isSoldOut
                                  ? '매진'
                                  : `잔여 ${remainingSeats}석`}
                              </span>
                            </div>

                            {/* 출발 ——— 도착 */}
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-2xl font-bold ${isSoldOut ? 'text-gray-300' : 'text-gray-900'}`}
                                >
                                  {formatTimeView(String(depplandtime))}
                                </span>
                                <span
                                  className={`text-xs ${isSoldOut ? 'text-gray-300' : 'text-gray-400'}`}
                                >
                                  {startStationForView}
                                </span>
                              </div>
                              <div className="flex flex-1 flex-col items-center gap-0.5">
                                <span className="text-xs text-gray-400">
                                  {durationText}
                                </span>
                                <div className="flex w-full items-center">
                                  <div
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSoldOut ? 'bg-gray-200' : 'bg-blue'}`}
                                  />
                                  <div
                                    className={`flex-1 border-t ${isSoldOut ? 'border-gray-200' : 'border-blue/30'}`}
                                  />
                                  <div
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSoldOut ? 'bg-gray-200' : 'bg-blue'}`}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">
                                  NON-STOP
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-2xl font-bold ${isSoldOut ? 'text-gray-300' : 'text-gray-900'}`}
                                >
                                  {formatTimeView(String(arrplandtime))}
                                </span>
                                <span
                                  className={`text-xs ${isSoldOut ? 'text-gray-300' : 'text-gray-400'}`}
                                >
                                  {endStationForView}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 구분선 */}
                          <div className="relative self-stretch">
                            <div className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-gray-50" />
                            <div className="h-full border-l border-dashed border-gray-200" />
                            <div className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-gray-50" />
                          </div>

                          {/* 요금 구간 (1/10) */}
                          <div className="flex flex-[1] flex-col items-center justify-between gap-3 p-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold tracking-wider text-gray-400">
                                TOTAL FARE
                              </span>
                              <span
                                className={`text-xl font-bold ${isSoldOut ? 'text-gray-300' : 'text-blue'}`}
                              >
                                {isSoldOut
                                  ? '-'
                                  : `${Number(adultcharge).toLocaleString('ko-KR')}원`}
                              </span>
                              <span className="text-[9px] text-gray-400">
                                {`성인 ${adult}${kid > 0 ? ` 아동 ${kid}` : ''}`}
                              </span>
                            </div>
                            <button
                              disabled={isSoldOut}
                              onClick={() =>
                                handleSelectTrain(
                                  depplandtime,
                                  arrplandtime,
                                  traingradename,
                                  trainno,
                                  adultcharge,
                                )
                              }
                              className={`w-full rounded-lg py-1.5 text-xs font-bold transition-colors ${
                                isSoldOut
                                  ? 'cursor-not-allowed bg-gray-100 text-gray-300'
                                  : 'bg-blue text-white hover:bg-blue/90'
                              }`}
                            >
                              선택
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCTrainCheckPage;

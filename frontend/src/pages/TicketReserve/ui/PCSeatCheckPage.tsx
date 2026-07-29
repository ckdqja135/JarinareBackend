/**
 * @role: pages — PC 좌석 선택 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import PCSeat from '@/widgets/TicketReserve/ui/PCSeat';
import { usePCSeatCheckPage } from '../hooks/usePCSeatCheckPage';
import down from '@/assets/icons/down.png';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const PCSeatCheckPage = () => {
  const {
    handleSingleSelect,
    handleAllSelect,
    seatsInfo,
    locks,
    isLocksLoaded,
    seatsStateCount,
    trainTypeDisplay,
    startStationForView,
    endStationForView,
    selectKid,
    selectAdult,
    trainNo,
    seatsState,
    seatsRows,
    navigate,
    user,
    isAllSelected,
    isAllLocked,
    openModal,
    isTrainDropdownOpen,
    trainNoArrayWithCongestion,
    handleToggleTrainDropdown,
    handleCloseTrainDropdown,
    handleSelectTrainNo,
    trainNoSeatsCount,
    isLoggedIn,
  } = usePCSeatCheckPage();

  if (!seatsState) return <LoadingScreen />;

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-gray-50"
      onClick={handleCloseTrainDropdown}
    >
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-96 pb-16 pt-6">
            {/* 제목칸 + 호차 선택 드롭다운 */}
            <div className="mb-6 flex items-end justify-between px-2">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
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
                  좌석 선택
                </button>
                <span className="text-[10px] font-bold tracking-widest text-gray-400">
                  TRAIN SELECTION
                </span>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">
                  {trainTypeDisplay}
                </h1>
                <p className="mt-0.5 text-sm text-gray-400">
                  {startStationForView} → {endStationForView}
                </p>
              </div>

              {/* 호차 선택 드롭다운 */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleToggleTrainDropdown}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 shadow-sm"
                >
                  <span className="text-xs text-gray-500">호차선택</span>
                  <span className="text-xs font-semibold text-blue">
                    {trainNo}호차 (잔여 {trainNoSeatsCount}석/24석)
                  </span>
                  <img src={down} width={9} height={6} className="opacity-30" />
                </button>
                {isTrainDropdownOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    {trainNoArrayWithCongestion.map(
                      ({ trainNo: no, trainNoView, label, bg, color }) => (
                        <div
                          key={no}
                          onClick={() => handleSelectTrainNo(no)}
                          className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50"
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            {no}호차 잔여{' '}
                            <span className="text-blue">{trainNoView}</span>
                            석/24석
                          </span>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                            style={{ backgroundColor: bg, color }}
                          >
                            {label}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 좌석 선택 카드 */}
            <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* 타이틀 칸 */}
              <div className="flex items-center justify-center border-b border-gray-100 bg-gray-50/50 px-8 py-4">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue" />
                    <span className="text-xs font-semibold text-gray-600">
                      선택됨
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-lightGray" />
                    <span className="text-xs font-semibold text-gray-600">
                      이용 불가
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-lightGray bg-white" />
                    <span className="text-xs font-semibold text-gray-600">
                      이용 가능
                    </span>
                  </div>
                </div>
              </div>

              {/* 좌석 선택칸 */}
              <div className="px-8 pb-2 pt-1">
                <div className="flex flex-col items-center px-8 pb-2 pt-0">
                  {/* 열 헤더 */}
                  <div className="mb-2 flex w-fit gap-10 text-sm text-gray-400">
                    <div className="flex gap-3">
                      <span className="flex h-14 w-14 items-center justify-center">
                        A
                      </span>
                      <span className="flex h-14 w-14 items-center justify-center">
                        B
                      </span>
                    </div>
                    <div className="w-14" />
                    <div className="flex gap-3">
                      <span className="flex h-14 w-14 items-center justify-center">
                        C
                      </span>
                      <span className="flex h-14 w-14 items-center justify-center">
                        D
                      </span>
                    </div>
                  </div>

                  {seatsRows.map((row) => {
                    const leftSeats = [`A${row}`, `B${row}`];
                    const rightSeats = [`C${row}`, `D${row}`];

                    return (
                      <div
                        key={row}
                        className="mb-3 flex w-fit items-center gap-10"
                      >
                        <div className="flex gap-3">
                          {leftSeats.map((id) => {
                            const seatState = seatsState[id];
                            const isMine = seatsInfo.some(
                              (item) =>
                                item.seatId === id && item.userId === user?.uid,
                            );
                            const isOther = seatsInfo.some(
                              (item) =>
                                item.seatId === id && item.userId !== user?.uid,
                            );
                            const isLocked = Object.entries(locks).some(
                              ([seatId, uid]) =>
                                seatId === id && uid !== user?.uid,
                            );
                            return (
                              <PCSeat
                                key={id}
                                label={id}
                                onClick={
                                  isLocksLoaded
                                    ? () => handleSingleSelect(id)
                                    : null
                                }
                                bgColor={
                                  isMine
                                    ? 'blue'
                                    : isOther || isLocked
                                      ? 'lightGray'
                                      : seatState
                                        ? 'blue'
                                        : 'lightesGray'
                                }
                              />
                            );
                          })}
                        </div>
                        <span className="flex w-14 items-center justify-center text-sm text-gray-400">
                          {row}
                        </span>
                        <div className="flex gap-3">
                          {rightSeats.map((id) => {
                            const seatState = seatsState[id];
                            const isMine = seatsInfo.some(
                              (item) =>
                                item.seatId === id && item.userId === user?.uid,
                            );
                            const isOther = seatsInfo.some(
                              (item) =>
                                item.seatId === id && item.userId !== user?.uid,
                            );
                            const isLocked = Object.entries(locks).some(
                              ([seatId, uid]) =>
                                seatId === id && uid !== user?.uid,
                            );
                            return (
                              <PCSeat
                                key={id}
                                label={id}
                                onClick={
                                  isLocksLoaded
                                    ? () => handleSingleSelect(id)
                                    : null
                                }
                                bgColor={
                                  isMine
                                    ? 'blue'
                                    : isOther || isLocked
                                      ? 'lightGray'
                                      : seatState
                                        ? 'blue'
                                        : 'lightesGray'
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 버튼 카드 — 하단 고정 */}
            <div
              className="fixed bottom-6 w-[680px] -translate-x-1/2 overflow-hidden rounded-xl bg-white shadow-xl"
              style={{ left: 'calc(110px + 50vw)' }}
            >
              {!isLoggedIn ? (
                <div className="flex justify-center px-8 py-4">
                  <LoginRequiredBlock
                    description="로그인 후 예매할 수 있어요"
                    onLogin={() => navigate('/auth/login')}
                    size="sm"
                    horizontal
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between px-8 py-3">
                  {/* 인원수 칸 */}
                  <div className="flex flex-[1] flex-col items-center justify-center gap-0">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400">
                      SELECTION
                    </span>
                    <span className="text-xl font-bold text-blue">
                      {seatsStateCount}
                      <span className="ml-1.5 text-sm font-normal text-gray-400">
                        / {selectKid + selectAdult} Seats
                      </span>
                    </span>
                  </div>

                  <div className="mx-6 h-10 w-px bg-gray-100" />

                  <div className="flex flex-[10] items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-gray-400">
                        SELECTED SEATS
                      </span>
                      <div className="flex gap-2.5">
                        {Array.from(
                          { length: selectKid + selectAdult },
                          (_, i) => (
                            <div
                              key={i}
                              className={`h-4 w-4 rounded ${i < seatsStateCount ? 'bg-blue' : 'border border-gray-200'}`}
                            />
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={
                          isLocksLoaded && isAllLocked
                            ? undefined
                            : handleAllSelect
                        }
                        className={`rounded-lg border px-5 py-2.5 text-xs font-bold transition-colors ${isLocksLoaded && isAllLocked ? 'border-gray-200 bg-white text-gray-300' : 'border-blue bg-white text-blue hover:bg-blue/5'}`}
                      >
                        자동 선택
                      </button>
                      <button
                        onClick={
                          isAllSelected
                            ? () => openModal('PayModal')
                            : undefined
                        }
                        className={`rounded-lg px-7 py-2.5 text-xs font-bold text-white transition-colors ${isAllSelected ? 'bg-blue hover:bg-blue/90' : 'bg-gray-300'}`}
                      >
                        {isAllSelected
                          ? '예매'
                          : `${seatsStateCount} / ${selectKid + selectAdult} 선택`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCSeatCheckPage;

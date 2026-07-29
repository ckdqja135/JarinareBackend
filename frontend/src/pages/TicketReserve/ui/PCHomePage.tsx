/**
 * @role: pages — PC 홈 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { DESTINATIONS } from '@/widgets/TicketReserve/constants/RecommendConstants';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import ReserveTicket from '@/widgets/TicketReserve/ui/ReserveTicket';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import useModalStore from '@/widgets/model/ReserveStore';
import PCStartPlaceDropdown from '@/widgets/TicketReserve/ui/PCStartPlaceDropdown';
import PCEndPlaceDropdown from '@/widgets/TicketReserve/ui/PCEndPlaceDropdown';
import PCDayDropdown from '@/widgets/TicketReserve/ui/PCDayDropdown';
import PCCountDropdown from '@/widgets/TicketReserve/ui/PCCountDropdown';
import { usePCHomePage } from '../hooks/usePCHomePage';
import PCDestinationModal from '@/widgets/TicketReserve/ui/PCDestinationModal';
import start_station from '@/assets/icons/start_station.png';
import end_station from '@/assets/icons/end_station.png';
import calendar from '@/assets/icons/calendar.png';
import on_user from '@/assets/icons/on_user.png';
import change from '@/assets/icons/change.png';
import homeBg from '@/assets/background/홈.png';

const PCHomePage = () => {
  const { isShow, modalType } = useModalStore();
  const {
    openDropdown,
    setOpenDropdown,
    dropdownRef,
    startStationForView,
    endStationForView,
    startDayForView,
    adult,
    kid,
    handleSwap,
    handleSearch,
    isSearchDisabled,
    selectedDestination,
    setSelectedDestination,
  } = usePCHomePage();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-10 pb-16 pt-10">
            {/* 제목 + 예약 위젯 카드 */}
            <div
              className="mb-10 rounded-lg border border-gray-200 p-12 shadow-sm"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${homeBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <h1 className="mb-1 text-4xl font-black tracking-tight text-white">
                여행의 시작, 여기서 찾으세요
              </h1>
              <p className="mb-5 text-sm text-white/70">
                Where will your next journey take you?
              </p>
              <div className="w-2/3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div ref={dropdownRef} className="flex items-center gap-4">
                  {/* 출발역 */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === 'start' ? null : 'start',
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:border-blue ${openDropdown === 'start' ? 'border-blue' : 'border-gray-200'}`}
                    >
                      <img width={16} height={16} src={start_station} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-400">
                          출발역
                        </span>
                        <span
                          className={`text-sm font-semibold ${startStationForView ? 'text-black' : 'text-gray-300'}`}
                        >
                          {startStationForView || '출발역 선택'}
                        </span>
                      </div>
                    </button>
                    {openDropdown === 'start' && (
                      <PCStartPlaceDropdown
                        onClose={() => setOpenDropdown(null)}
                      />
                    )}
                  </div>

                  {/* 역 전환 */}
                  <button
                    onClick={handleSwap}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lightBlue"
                  >
                    <img
                      width={18}
                      height={18}
                      src={change}
                      style={{ transform: 'rotate(90deg)' }}
                    />
                  </button>

                  {/* 도착역 */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === 'end' ? null : 'end')
                      }
                      className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:border-blue ${openDropdown === 'end' ? 'border-blue' : 'border-gray-200'}`}
                    >
                      <img width={16} height={16} src={end_station} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-400">
                          도착역
                        </span>
                        <span
                          className={`text-sm font-semibold ${endStationForView ? 'text-black' : 'text-gray-300'}`}
                        >
                          {endStationForView || '도착역 선택'}
                        </span>
                      </div>
                    </button>
                    {openDropdown === 'end' && (
                      <PCEndPlaceDropdown
                        onClose={() => setOpenDropdown(null)}
                      />
                    )}
                  </div>

                  {/* 가는날 */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === 'day' ? null : 'day')
                      }
                      className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:border-blue ${openDropdown === 'day' ? 'border-blue' : 'border-gray-200'}`}
                    >
                      <img width={16} height={16} src={calendar} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-400">
                          가는날
                        </span>
                        <span
                          className={`text-sm font-semibold ${startDayForView ? 'text-black' : 'text-gray-300'}`}
                        >
                          {startDayForView || '날짜 선택'}
                        </span>
                      </div>
                    </button>
                    {openDropdown === 'day' && (
                      <PCDayDropdown onClose={() => setOpenDropdown(null)} />
                    )}
                  </div>

                  {/* 인원 */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === 'count' ? null : 'count',
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:border-blue ${openDropdown === 'count' ? 'border-blue' : 'border-gray-200'}`}
                    >
                      <img width={16} height={16} src={on_user} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-400">
                          인원
                        </span>
                        <span
                          className={`text-sm font-semibold ${adult + kid > 0 ? 'text-black' : 'text-gray-300'}`}
                        >
                          {adult + kid > 0 ? `${adult + kid}명` : '인원 선택'}
                        </span>
                      </div>
                    </button>
                    {openDropdown === 'count' && (
                      <PCCountDropdown onClose={() => setOpenDropdown(null)} />
                    )}
                  </div>

                  {/* 검색 버튼 */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearchDisabled}
                    className="flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-blue px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    검색
                  </button>
                </div>
              </div>
            </div>

            {/* 콘텐츠 그리드 */}
            <div className="flex flex-col gap-6">
              {/* 내 승차권 + 추천 여행지 */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4">
                  <h2 className="mb-3 text-lg font-bold text-gray-900">
                    내 승차권
                  </h2>
                  <ReserveTicket />
                </div>

                <div className="col-span-8 flex flex-col gap-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    추천 여행지
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {DESTINATIONS.map((destination) => (
                      <div
                        key={destination.city}
                        onClick={() => setSelectedDestination(destination)}
                        className="relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg p-4 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: destination.image
                            ? undefined
                            : destination.gradient,
                          backgroundImage: destination.image
                            ? `url(${destination.image})`
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          height: '90px',
                        }}
                      >
                        {destination.image && (
                          <div className="absolute inset-0 bg-black/30" />
                        )}
                        <div className="relative mt-auto flex flex-col gap-0.5">
                          <span className="text-base font-bold text-white">
                            {destination.city}
                          </span>
                          <span className="text-xs text-white/80">
                            {destination.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 이벤트 */}
              <div>
                <SeasonBanner />
              </div>
            </div>
          </div>
        </main>
      </div>
      {isShow && modalType ? <Modal /> : null}
      {selectedDestination && (
        <PCDestinationModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
        />
      )}
    </div>
  );
};

export default PCHomePage;

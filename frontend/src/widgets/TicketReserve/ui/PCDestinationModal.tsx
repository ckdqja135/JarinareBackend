/**
 * @role: widgets — PC 추천여행지 상세 모달 UI
 * @rule: 렌더링만 담당, createPortal로 전체 화면 오버레이
 */
import { createPortal } from 'react-dom';
import type { PCDestinationModalProps } from '../types/RecommendDestinationType';
import { CITY_HIGHLIGHTS } from '../constants/PCDestinationConstants';
import { usePCDestinationModal } from '../hooks/usePCDestinationModal';
import { formatTimeView } from '@/shared/lib/formatDate';
import { CountAdultButton } from './CountAdultButton';
import { CountKidButton } from './CountKidButton';

const PCDestinationModal = ({
  destination,
  onClose,
}: PCDestinationModalProps) => {
  const { city, desc, image, gradient } = destination;
  const highlights = CITY_HIGHLIGHTS[city] ?? [];
  const {
    legTrains,
    handleTrainClick,
    handleConfirmPassengers,
    pendingTrain,
    destStationName,
    selectedDepartureName,
    searchQuery,
    setSearchQuery,
    suggestions,
    handleSelectSuggestion,
    dateOptions,
    selectedDate,
    setSelectedDate,
    selectedDateLabel,
    adult,
    kid,
  } = usePCDestinationModal(city);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 lg:left-[220px] lg:top-14 lg:backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-[640px] animate-fade-up flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 배경 이미지 */}
        <div
          className="relative h-56 shrink-0"
          style={{
            backgroundImage: image
              ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${image})`
              : `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), ${gradient}`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-5">
            <p className="text-2xl font-black text-white">{city}</p>
            <p className="mt-0.5 text-sm text-white/80">{desc}</p>
          </div>
        </div>

        {/* 스크롤 가능한 내용 */}
        <div className="flex-1 overflow-y-auto">
          {/* 추천 여행지 */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lightBlue">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800">추천 여행지</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {highlights.map(({ emoji, title, desc: hdesc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-3"
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                      {hdesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 열차 조회 */}
          <div className="px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lightBlue">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 6V4M10 6V4M14 6V4M18 6V4" />
                  <path d="M6 18v2M10 18v2M14 18v2M18 18v2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M7 12h2M15 12h2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  구간별 실시간 열차
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedDateLabel} 기준
                </p>
              </div>
            </div>

            {/* 출발지 검색 */}
            <div className="relative mb-3">
              <p className="mb-1.5 text-xs font-bold text-gray-400">
                출발지 검색
              </p>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="14"
                  height="14"
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
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="출발역 이름 검색 (예: 서울, 대전)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue focus:bg-white"
                />
              </div>
              {/* 자동완성 드롭다운 */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s.nodeid}
                      onClick={() => handleSelectSuggestion(s.nodename)}
                      className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-lightBlue"
                    >
                      {s.nodename}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 날짜 선택 */}
            <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
              {dateOptions.map(({ date, label, isToday }) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    selectedDate === date
                      ? 'bg-blue text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {isToday ? '오늘' : label.slice(0, label.indexOf('(') - 1)}
                </button>
              ))}
            </div>

            {/* 구간별 열차 목록 */}
            {!selectedDepartureName ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-sm font-bold text-gray-400">
                  출발역을 검색해주세요
                </p>
              </div>
            ) : legTrains.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
                </svg>
                <p className="text-xs font-bold text-gray-400">
                  해당 출발역에서 {destStationName}까지의 경로가 없습니다
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {legTrains.map(
                  ({ leg, nextTrain, isFetching, trainGradeDisplay }, i) => (
                    <div key={i}>
                      {/* 구간 헤더 */}
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-800">
                          {leg.from}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                        <span className="text-sm font-bold text-gray-800">
                          {leg.to}
                        </span>
                        <span className="rounded bg-lightBlue px-1.5 py-0.5 text-[10px] font-bold text-blue">
                          {leg.train}
                        </span>
                      </div>

                      {/* 다음 열차 */}
                      {isFetching ? (
                        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
                      ) : nextTrain === null ? (
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line
                              x1="12"
                              y1="16"
                              x2="12.01"
                              y2="16"
                              strokeWidth="2.5"
                            />
                          </svg>
                          <p className="text-xs font-bold text-gray-400">
                            조회된 열차가 없습니다
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`overflow-hidden rounded-xl border border-gray-100 transition-colors ${nextTrain.adultcharge === 0 ? 'opacity-50' : ''} ${pendingTrain?.train === nextTrain ? 'bg-lightBlue' : 'bg-gray-50'}`}
                        >
                          {/* 열차 정보 행 */}
                          <button
                            onClick={() => handleTrainClick(nextTrain, leg)}
                            disabled={nextTrain.adultcharge === 0}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                                {trainGradeDisplay}
                              </span>
                              <span className="text-sm font-bold text-gray-800">
                                {formatTimeView(String(nextTrain.depplandtime))}
                              </span>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#d1d5db"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                              <span className="text-sm font-bold text-gray-800">
                                {formatTimeView(String(nextTrain.arrplandtime))}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">
                                {nextTrain.adultcharge === 0
                                  ? '매진'
                                  : `${nextTrain.adultcharge.toLocaleString('ko-KR')}원`}
                              </span>
                              {nextTrain.adultcharge > 0 && (
                                <span className="text-xs font-bold text-blue">
                                  <span className="flex items-center gap-1 text-xs font-bold text-blue">
                                    선택
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      {pendingTrain?.train === nextTrain ? (
                                        <polyline points="18 15 12 9 6 15" />
                                      ) : (
                                        <polyline points="6 9 12 15 18 9" />
                                      )}
                                    </svg>
                                  </span>
                                </span>
                              )}
                            </div>
                          </button>

                          {/* 펼쳐지는 인원 선택 — 동일 카드 내 */}
                          {pendingTrain?.train === nextTrain && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 pb-3 pt-2">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">
                                    어른
                                    {adult > 0 && (
                                      <span className="ml-1.5 text-blue">
                                        {adult}명
                                      </span>
                                    )}
                                  </span>
                                  <CountAdultButton />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">
                                    어린이
                                    {kid > 0 && (
                                      <span className="ml-1.5 text-blue">
                                        {kid}명
                                      </span>
                                    )}
                                  </span>
                                  <CountKidButton />
                                </div>
                              </div>
                              <button
                                onClick={handleConfirmPassengers}
                                disabled={adult + kid === 0}
                                className={`mt-3 w-full rounded-lg py-2 text-xs font-bold text-white transition-colors ${adult + kid === 0 ? 'bg-gray-300' : 'bg-blue hover:bg-blue/90'}`}
                              >
                                {adult + kid === 0 ? (
                                  '인원을 선택해주세요'
                                ) : (
                                  <span className="flex items-center justify-center gap-1.5">
                                    좌석 선택
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="2" y1="12" x2="20" y2="12" />
                                      <polyline points="14 6 20 12 14 18" />
                                    </svg>
                                  </span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-blue py-3 text-sm font-bold text-white transition-colors hover:bg-blue/90"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PCDestinationModal;

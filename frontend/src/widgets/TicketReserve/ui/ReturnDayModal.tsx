import prev from '@/assets/icons/prev.png';
import next from '@/assets/icons/next.png';
import useModalStore from '../../model/ReserveStore';
import { useMaxDate } from '../hooks/ReserveHook';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { formatDate, formatDateForView } from '@/shared/lib/formatDate';
import { useEffect, useRef, useState } from 'react';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const ITEM_SIZE = 52;
const GAP = 8;
const ITEM_STEP = ITEM_SIZE + GAP;
const MIN_SCALE = 0.72;

type ViewMode = 'day' | 'month' | 'year';

const ReturnDayModal = () => {
  const { closeModal } = useModalStore();
  const { maxDate } = useMaxDate();
  const { setEndDay, setEndDayForView } = trainDataStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minYear = today.getFullYear();
  const maxYear = maxDate.getFullYear();

  // 선택 가능한 월 (year 기준)
  const validMonths = MONTHS.filter((m) => {
    const val = viewYear * 12 + (m - 1);
    const min = today.getFullYear() * 12 + today.getMonth();
    const max = maxDate.getFullYear() * 12 + maxDate.getMonth();
    return val >= min && val <= max;
  });

  // 선택 가능한 일
  const validDays: Date[] = [];
  const cursor = new Date(today);
  while (cursor <= maxDate) {
    if (cursor.getFullYear() === viewYear && cursor.getMonth() === viewMonth) {
      validDays.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const minMonth = today.getFullYear() * 12 + today.getMonth();
  const maxMonth = maxDate.getFullYear() * 12 + maxDate.getMonth();
  const curMonth = viewYear * 12 + viewMonth;
  const canPrev = curMonth > minMonth;
  const canNext = curMonth < maxMonth;

  const handlePrev = () => {
    if (!canPrev) return;
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleNext = () => {
    if (!canNext) return;
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  useEffect(() => {
    if (viewMode !== 'day') return;
    if (!scrollRef.current || validDays.length === 0) return;
    const idx = validDays.findIndex((d) => isSameDay(d, selectedDate));
    const targetIdx = idx === -1 ? 0 : idx;
    if (idx === -1) setSelectedDate(validDays[0]);
    const container = scrollRef.current;
    const offset = Math.max(
      0,
      targetIdx * ITEM_STEP - (container.clientWidth - ITEM_SIZE) / 2,
    );
    container.scrollLeft = offset;
    setScrollLeft(offset);
  }, [viewMonth, viewYear, viewMode]);

  const handleScroll = () => {
    if (!scrollRef.current || validDays.length === 0) return;
    const container = scrollRef.current;
    setScrollLeft(container.scrollLeft);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const idx = Math.round(container.scrollLeft / ITEM_STEP);
      const clamped = Math.max(0, Math.min(idx, validDays.length - 1));
      setSelectedDate(validDays[clamped]);
    }, 100);
  };

  const getSize = (i: number): number => {
    const dist = Math.abs(scrollLeft - i * ITEM_STEP);
    const t = Math.min(dist / (ITEM_STEP * 1.5), 1);
    return Math.round(ITEM_SIZE * (1 - t * (1 - MIN_SCALE)));
  };

  const handleSelectMonth = (month: number) => {
    setViewMonth(month - 1);
    setViewMode('day');
  };

  const handleSelectYear = (year: number) => {
    setViewYear(year);
    setViewMode('month');
  };

  const handleSelect = () => {
    setEndDay(formatDate(selectedDate));
    setEndDayForView(formatDateForView(selectedDate));
    closeModal('ReturnDayModal');
  };

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40 lg:justify-center"
      onClick={() => closeModal('ReturnDayModal')}
    >
      <div
        className="mb-4 w-[319px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* 헤더 */}
        {viewMode === 'day' && (
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={!canPrev}
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-opacity ${!canPrev ? 'opacity-30' : ''}`}
            >
              <img width={7} height={12} src={prev} />
            </button>
            <button
              onClick={() => setViewMode('month')}
              className="text-base font-bold text-gray-800"
            >
              {viewYear}년 {viewMonth + 1}월
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-opacity ${!canNext ? 'opacity-30' : ''}`}
            >
              <img width={7} height={12} src={next} />
            </button>
          </div>
        )}

        {viewMode === 'month' && (
          <div className="mb-5 flex items-center justify-between">
            <div className="w-8" />
            <button
              onClick={() => setViewMode('year')}
              className="text-base font-bold text-gray-800"
            >
              {viewYear}년
            </button>
            <div className="w-8" />
          </div>
        )}

        {viewMode === 'year' && (
          <div className="mb-5 flex items-center justify-center">
            <span className="text-base font-bold text-gray-800">년도 선택</span>
          </div>
        )}

        {/* 일 피커 */}
        {viewMode === 'day' &&
          (validDays.length > 0 ? (
            <div className="relative" style={{ height: ITEM_SIZE }}>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="absolute inset-0 flex items-center overflow-x-auto"
                style={{
                  gap: GAP,
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  paddingLeft: `calc(50% - ${ITEM_SIZE / 2}px)`,
                  paddingRight: `calc(50% - ${ITEM_SIZE / 2}px)`,
                }}
              >
                {validDays.map((date, i) => {
                  const size = getSize(i);
                  const dist = Math.abs(scrollLeft - i * ITEM_STEP);
                  const isCentered = dist < ITEM_STEP / 2;
                  const dow = date.getDay();
                  const isSun = dow === 0;
                  const isSat = dow === 6;

                  return (
                    <div
                      key={date.toISOString()}
                      style={{
                        minWidth: ITEM_SIZE,
                        height: ITEM_SIZE,
                        scrollSnapAlign: 'center',
                      }}
                      className="flex shrink-0 items-center justify-center"
                    >
                      <div
                        style={{ width: size, height: size }}
                        className={`flex flex-col items-center justify-center gap-0.5 rounded-xl ${
                          isCentered ? 'bg-blue' : 'bg-gray-100'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-medium ${
                            isCentered
                              ? 'text-white/80'
                              : isSun
                                ? 'text-red'
                                : isSat
                                  ? 'text-blue'
                                  : 'text-gray-400'
                          }`}
                        >
                          {DAYS_KO[dow]}
                        </span>
                        <span
                          className={`text-base font-bold ${isCentered ? 'text-white' : 'text-gray-700'}`}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-center text-sm text-gray-400">
              선택 가능한 날짜가 없습니다
            </div>
          ))}

        {/* 월 선택 */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((m) => {
              const isValid = validMonths.includes(m);
              const isSelected = m - 1 === viewMonth;
              return (
                <button
                  key={m}
                  disabled={!isValid}
                  onClick={() => handleSelectMonth(m)}
                  className={`rounded-md py-3 text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue text-white'
                      : isValid
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  {m}월
                </button>
              );
            })}
          </div>
        )}

        {/* 년 선택 */}
        {viewMode === 'year' && (
          <div className="grid grid-cols-3 gap-2">
            {Array.from(
              { length: maxYear - minYear + 1 },
              (_, i) => minYear + i,
            ).map((y) => {
              const isSelected = y === viewYear;
              return (
                <button
                  key={y}
                  onClick={() => handleSelectYear(y)}
                  className={`rounded-md py-3 text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {y}년
                </button>
              );
            })}
          </div>
        )}

        {/* 선택 버튼 */}
        <button
          onClick={handleSelect}
          className="mt-5 w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white"
        >
          선택
        </button>
      </div>
    </div>
  );
};

export default ReturnDayModal;

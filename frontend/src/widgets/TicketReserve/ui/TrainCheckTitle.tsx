import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { formatDate, formatDateForView, formatStartDate } from '@/shared/lib/formatDate';
import { useEffect, useRef, useState } from 'react';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

const ITEM_W = 62;
const ITEM_H = 76;
const GAP = 8;
const ITEM_STEP = ITEM_W + GAP;
const MIN_SCALE = 0.72;
const PADDING_COUNT = 3;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const TrainCheckTitle = () => {
  const { setStartDay, setStartDayForView, startDay } = trainDataStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 6);

  const validDays: Date[] = [];
  const cursor = new Date(today);
  while (cursor <= maxDate) {
    validDays.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // 앞쪽 선택 불가 날짜 (오늘 기준 이전 3일)
  const preDays: Date[] = Array.from({ length: PADDING_COUNT }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (PADDING_COUNT - i));
    return d;
  });

  // 뒤쪽 선택 불가 날짜 (마지막 날 기준 이후 3일)
  const postDays: Date[] = Array.from({ length: PADDING_COUNT }, (_, i) => {
    const d = new Date(maxDate);
    d.setDate(maxDate.getDate() + (i + 1));
    return d;
  });

  const allDays = [...preDays, ...validDays, ...postDays];

  const getInitialIndex = () => {
    if (!startDay) return 0;
    const stored = formatStartDate(startDay);
    stored.setHours(0, 0, 0, 0);
    const idx = validDays.findIndex((d) => isSameDay(d, stored));
    return idx >= 0 ? idx : 0;
  };

  const initialValidIdx = getInitialIndex();
  // CSS padding 방식: scrollLeft=0 → allDays[0] 가운데, scrollLeft=i*ITEM_STEP → allDays[i] 가운데
  const initialIdx = PADDING_COUNT + initialValidIdx;
  const [scrollLeft, setScrollLeft] = useState(initialIdx * ITEM_STEP);
  const [selectedDate, setSelectedDate] = useState<Date>(validDays[initialValidIdx]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStartDay(formatDate(selectedDate));
    setStartDayForView(formatDateForView(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = initialIdx * ITEM_STEP;
    setScrollLeft(initialIdx * ITEM_STEP);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    setScrollLeft(container.scrollLeft);

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const idx = Math.round(container.scrollLeft / ITEM_STEP);
      const clamped = Math.max(PADDING_COUNT, Math.min(idx, PADDING_COUNT + validDays.length - 1));
      setSelectedDate(validDays[clamped - PADDING_COUNT]);
      if (idx !== clamped) {
        container.scrollTo({ left: clamped * ITEM_STEP, behavior: 'smooth' });
      }
    }, 100);
  };

  const getSize = (i: number): { w: number; h: number } => {
    const dist = Math.abs(scrollLeft - i * ITEM_STEP);
    const t = Math.min(dist / (ITEM_STEP * 1.5), 1);
    const scale = 1 - t * (1 - MIN_SCALE);
    return { w: Math.round(ITEM_W * scale), h: Math.round(ITEM_H * scale) };
  };

  return (
    <div className="mt-4 w-full">
      <div className="relative" style={{ height: ITEM_H }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 flex items-center overflow-x-auto"
          style={{
            gap: GAP,
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
            paddingRight: `calc(50% - ${ITEM_W / 2}px)`,
          }}
        >
          {allDays.map((date, i) => {
            const { w, h } = getSize(i);
            const dist = Math.abs(scrollLeft - i * ITEM_STEP);
            const isCentered = dist < ITEM_STEP / 2;
            const isDisabled = i < PADDING_COUNT || i >= PADDING_COUNT + validDays.length;
            const dow = date.getDay();
            const isSun = dow === 0;
            const isSat = dow === 6;

            return (
              <div
                key={date.toISOString()}
                style={{ minWidth: ITEM_W, height: ITEM_H, scrollSnapAlign: 'center' }}
                className="flex shrink-0 items-center justify-center"
              >
                <div
                  style={{ width: w, height: h }}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl ${
                    isDisabled ? 'bg-white/50' : isCentered ? 'bg-blue' : 'bg-white'
                  }`}
                >
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color: isDisabled
                        ? '#D1D5DB'
                        : isSun
                          ? '#EA4335'
                          : isCentered
                            ? 'rgba(255,255,255,0.8)'
                            : isSat
                              ? '#0062FF'
                              : '#9CA3AF',
                    }}
                  >
                    {DAYS_KO[dow]}
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{
                      color: isDisabled
                        ? '#D1D5DB'
                        : isCentered
                          ? '#ffffff'
                          : '#374151',
                    }}
                  >
                    {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainCheckTitle;

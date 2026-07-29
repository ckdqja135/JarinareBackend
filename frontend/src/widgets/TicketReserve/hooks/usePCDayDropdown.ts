/**
 * @role: widgets — PC 날짜 드롭다운 상태·로직 훅
 * @rule: 상태·이벤트 핸들러·달력 계산만 담당
 */
import { useState } from 'react';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useMaxDate } from '../hooks/ReserveHook';
import { formatDate, formatDateForView } from '@/shared/lib/formatDate';

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const usePCDayDropdown = (onClose: () => void) => {
  const { setStartDay, setStartDayForView } = trainDataStore();
  const { maxDate } = useMaxDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

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

  const isDisabled = (date: Date) => date < today || date > maxDate;

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) return;
    setSelectedDate(date);
    setStartDay(formatDate(date));
    setStartDayForView(formatDateForView(date));
    onClose();
  };

  // 해당 월의 캘린더 셀 생성 (앞쪽 빈칸 포함)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(viewYear, viewMonth, i + 1),
    ),
  ];

  return {
    today,
    selectedDate,
    viewYear,
    viewMonth,
    canPrev,
    canNext,
    cells,
    isDisabled,
    handlePrev,
    handleNext,
    handleSelect,
  };
};

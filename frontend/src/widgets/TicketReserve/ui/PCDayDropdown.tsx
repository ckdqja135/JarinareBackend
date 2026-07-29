/**
 * @role: widgets — PC 날짜 드롭다운 UI (캘린더)
 * @rule: 렌더링만 담당, onClose prop으로 닫기 처리
 */
import { usePCDayDropdown, isSameDay } from '../hooks/usePCDayDropdown';
import type { OnCloseProps } from '../types/PCDropdownTypes';
import prev from '@/assets/icons/prev.png';
import next from '@/assets/icons/next.png';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

const PCDayDropdown = ({ onClose }: OnCloseProps) => {
  const {
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
  } = usePCDayDropdown(onClose);

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 transition-opacity ${!canPrev ? 'opacity-30' : 'hover:bg-gray-200'}`}
        >
          <img width={6} height={10} src={prev} />
        </button>
        <span className="text-sm font-bold text-gray-800">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          onClick={handleNext}
          disabled={!canNext}
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 transition-opacity ${!canNext ? 'opacity-30' : 'hover:bg-gray-200'}`}
        >
          <img width={6} height={10} src={next} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-1 grid grid-cols-7">
        {DAYS_KO.map((d, i) => (
          <span
            key={d}
            className={`text-center text-xs font-semibold ${i === 0 ? 'text-red' : i === 6 ? 'text-blue' : 'text-gray-400'}`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const disabled = isDisabled(date);
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const dow = date.getDay();
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleSelect(date)}
              disabled={disabled}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${selected ? 'bg-blue text-white' : ''} ${!selected && isToday ? 'border border-blue text-blue' : ''} ${!selected && !isToday && !disabled ? (dow === 0 ? 'text-red hover:bg-gray-100' : dow === 6 ? 'text-blue hover:bg-gray-100' : 'text-gray-700 hover:bg-gray-100') : ''} ${disabled ? 'cursor-not-allowed text-gray-300' : ''}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PCDayDropdown;

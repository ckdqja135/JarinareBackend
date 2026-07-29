/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useReserveTicket } from '../hooks/useReserveTicket';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const ReserveTicket = () => {
  const {
    isEmpty,
    isLoggedIn,
    handleLoginNavigate,
    ticket,
    trainTypeName,
    startLabel,
    endLabel,
    dotDate,
    seatIds,
    handleDetail,
    handleSeatChange,
  } = useReserveTicket();

  if (isEmpty || !ticket) {
    if (!isLoggedIn) {
      return (
        <div className="relative h-[196px] w-full shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="pointer-events-none flex h-full select-none flex-col items-center justify-center gap-1 blur-sm">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="12" y2="17" />
            </svg>
            <span className="text-tiny font-bold">
              아직 예매한 승차권이 없어요
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <LoginRequiredBlock onLogin={handleLoginNavigate} size="sm" />
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-[196px] w-full shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-white shadow-md">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="12" y2="17" />
        </svg>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  return (
    <div className="flex h-[196px] w-full shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-md">
      {/* 상단: TRAIN + DATE */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex flex-col items-center gap-0.5">
          <span className="rounded bg-lightBlue px-2 py-0.5 text-[10px] font-bold text-blue">
            TRAIN
          </span>
          <span className="text-xs font-semibold text-gray-700">
            {trainTypeName}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] text-gray-400">DATE</span>
          <span className="text-xs font-semibold text-gray-700">{dotDate}</span>
        </div>
      </div>

      {/* 중앙: 출발 → 도착 */}
      <div className="flex flex-1 items-center justify-between px-5">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-gray-400">출발역</span>
          <span className="text-2xl font-black text-black">
            {ticket.startStationForView}
          </span>
          <span className="text-[10px] text-gray-500">{startLabel}</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1 px-4">
          <div className="flex w-full items-center">
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <svg
              className="mx-2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="2" y1="12" x2="20" y2="12" />
              <polyline points="14 6 20 12 14 18" />
            </svg>
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          </div>
          <span className="text-[10px] font-semibold text-gray-400">
            DIRECT
          </span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-gray-400">도착역</span>
          <span className="text-2xl font-black text-black">
            {ticket.endStationForView}
          </span>
          <span className="text-[10px] text-gray-500">{endLabel}</span>
        </div>
      </div>

      {/* 하단: 좌석 + 버튼 */}
      <div className="flex items-center justify-between border-t border-dashed border-gray-200 px-5 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400">SEAT</span>
          <span className="text-xs font-bold text-blue">{seatIds}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeatChange}
            className="rounded-md border border-blue bg-blue px-3 py-1.5 text-xs font-bold text-white hover:brightness-95"
          >
            좌석변경
          </button>
          <button
            onClick={handleDetail}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-blue hover:bg-gray-50"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReserveTicket;

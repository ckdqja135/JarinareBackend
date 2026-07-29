/**
 * @role: widgets/TicketReturn — ui
 * @rule: 렌더링만 담당, createPortal로 전체 화면 오버레이, PC 전용(hidden lg:flex)
 */
import { createPortal } from 'react-dom';
import { usePCTicketReturnModal } from '../hooks/usePCTicketReturnModal';

const PCTicketReturnModal = () => {
  const {
    seat,
    trainTypeName,
    startTime,
    endTime,
    duration,
    passengerText,
    handleClose,
    handleConfirm,
  } = usePCTicketReturnModal();

  if (!seat) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] hidden items-center justify-center bg-black/40 lg:left-[220px] lg:top-14 lg:flex lg:backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-[420px] animate-fade-up rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 대제목 + X버튼 */}
        <div className="flex items-center justify-between px-7 pb-4 pt-7">
          <h2 className="text-xl font-black text-gray-900">승차권 반환</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          {/* 승차권 정보 카드 */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
            {/* 열차종류 / 날짜 */}
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                {trainTypeName}
              </span>
              <span className="text-xs text-gray-400">
                {seat.startDayForView}
              </span>
            </div>

            {/* 출발 → 도착 */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-gray-900">
                  {startTime}
                </span>
                <span className="text-xs text-gray-500">
                  {seat.startStationForView}
                </span>
              </div>
              <div className="flex flex-1 items-center">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                <div className="flex-1 border-t border-blue/30" />
                <span className="mx-2 shrink-0 text-[10px] text-gray-400">
                  {duration}
                </span>
                <div className="flex-1 border-t border-blue/30" />
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-gray-900">
                  {endTime}
                </span>
                <span className="text-xs text-gray-500">
                  {seat.endStationForView}
                </span>
              </div>
            </div>

            {/* 가로 구분선 */}
            <div className="my-3 border-t border-gray-200" />

            {/* 인원수 */}
            <p className="text-center text-sm font-semibold text-gray-700">
              {passengerText}
            </p>
          </div>

          {/* 안내 메시지 카드 */}
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ backgroundColor: 'rgba(234, 67, 53, 0.08)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EA4335"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
            </svg>
            <span className="text-xs font-bold text-red">
              반환 후에는 되돌릴 수 없어요.
            </span>
          </div>

          {/* 버튼 */}
          <div className="mt-1 flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-red py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
            >
              반환하기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PCTicketReturnModal;

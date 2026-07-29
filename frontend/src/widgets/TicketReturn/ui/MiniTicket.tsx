/**
 * @role: widgets/TicketReturn — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useMiniTicket } from '../hooks/useMiniTicket';
import type { MiniTicketProps } from '../types/TicketReturnType';

const MiniTicket = ({ onReturnPC }: MiniTicketProps = {}) => {
  const { tickets } = useMiniTicket();

  if (tickets.length === 0) {
    return (
      <div className="flex h-[100px] w-full flex-col items-center justify-center rounded-xl bg-white shadow-sm">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  return (
    <>
      {tickets.map(
        (
          {
            ticket,
            groups,
            trainTypeName,
            startLabel,
            endLabel,
            duration,
            handleReturn,
          },
          idx,
        ) => (
          <div
            key={idx}
            className="flex w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            {/* 왼쪽 메인 영역 */}
            <div className="flex flex-1 items-center gap-6 p-5">
              {/* 1/4: 메타 정보 */}
              <div className="flex w-36 shrink-0 flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                    {trainTypeName}
                  </span>
                  <span className="rounded-md bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                    예약완료
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-400">
                  {ticket.startDayForView}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {ticket.selectAdult > 0 && `어른 ${ticket.selectAdult}명`}
                  {ticket.selectAdult > 0 && ticket.selectKid > 0 && ' · '}
                  {ticket.selectKid > 0 && `어린이 ${ticket.selectKid}명`}
                </span>
              </div>

              {/* 1/4 ~ 3/4 구분선 */}
              <div className="self-stretch border-l border-gray-200" />

              {/* 3/4: 여정 */}
              <div className="flex flex-1 items-center gap-4">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold text-gray-900">
                    {startLabel}
                  </span>
                  <span className="text-base font-semibold text-gray-500">
                    {ticket.startStationForView}
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-center">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                    <div className="flex-1 border-t border-dashed border-gray-300" />
                    <svg
                      className="mx-2 shrink-0"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="3" width="16" height="14" rx="3" />
                      <path d="M4 11h16" />
                      <path d="M8 3v8M16 3v8" />
                      <path d="M7 17l-2 3M17 17l2 3" />
                      <path d="M6 20h12" />
                    </svg>
                    <div className="flex-1 border-t border-dashed border-gray-300" />
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                  </div>
                  <span className="text-xs text-gray-400">{duration}</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold text-gray-900">
                    {endLabel}
                  </span>
                  <span className="text-base font-semibold text-gray-500">
                    {ticket.endStationForView}
                  </span>
                </div>
              </div>
            </div>

            {/* 점선 구분 (컷아웃 효과) */}
            <div className="relative self-stretch">
              <div className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-gray-50" />
              <div className="h-full border-l border-dashed border-gray-200" />
              <div className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-gray-50" />
            </div>

            {/* 오른쪽 스텁 */}
            <div className="flex w-48 shrink-0 flex-col items-center justify-center gap-3 p-4">
              <span className="text-xs font-black tracking-tight text-gray-300">
                JARINARE
              </span>
              <button
                onClick={onReturnPC ? () => onReturnPC(groups) : handleReturn}
                className="rounded-lg bg-blue px-10 py-2 text-xs font-bold text-white transition-colors hover:bg-blue/90"
              >
                반환하기
              </button>
            </div>
          </div>
        ),
      )}
    </>
  );
};

export default MiniTicket;

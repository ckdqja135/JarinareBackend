/**
 * @role: widgets/TicketList — ui
 * @rule: 렌더링만 담당, 상태·로직 포함 금지
 */
import { MiniTicketVariantProps } from '../types/MiniTicketType';

// @role: ui — QR 코드 플레이스홀더 SVG
const QRCodePlaceholder = () => (
  <svg
    viewBox="0 0 25 25"
    className="h-full w-full text-gray-900"
    fill="currentColor"
  >
    <rect
      x="1"
      y="1"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect x="2.5" y="2.5" width="4" height="4" />
    <rect
      x="17"
      y="1"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect x="18.5" y="2.5" width="4" height="4" />
    <rect
      x="1"
      y="17"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect x="2.5" y="18.5" width="4" height="4" />
    <rect x="9" y="6" width="1.5" height="1.5" />
    <rect x="11" y="6" width="1.5" height="1.5" />
    <rect x="13" y="6" width="1.5" height="1.5" />
    <rect x="6" y="9" width="1.5" height="1.5" />
    <rect x="6" y="11" width="1.5" height="1.5" />
    <rect x="6" y="13" width="1.5" height="1.5" />
    <rect x="9" y="9" width="1.5" height="1.5" />
    <rect x="12" y="9" width="1.5" height="1.5" />
    <rect x="14" y="9" width="3" height="1.5" />
    <rect x="9" y="12" width="3" height="1.5" />
    <rect x="14" y="12" width="1.5" height="1.5" />
    <rect x="9" y="14" width="1.5" height="3" />
    <rect x="12" y="14" width="3" height="1.5" />
    <rect x="17" y="9" width="1.5" height="3" />
    <rect x="20" y="9" width="3" height="1.5" />
    <rect x="20" y="12" width="1.5" height="1.5" />
    <rect x="17" y="14" width="3" height="1.5" />
    <rect x="22" y="14" width="1.5" height="1.5" />
    <rect x="9" y="17" width="3" height="1.5" />
    <rect x="14" y="17" width="1.5" height="3" />
    <rect x="17" y="17" width="1.5" height="1.5" />
    <rect x="20" y="17" width="1.5" height="3" />
    <rect x="9" y="20" width="1.5" height="3" />
    <rect x="12" y="20" width="3" height="1.5" />
    <rect x="17" y="22" width="3" height="1.5" />
    <rect x="22" y="20" width="1.5" height="3" />
  </svg>
);

// @role: ui — 구간 연결 화살표 SVG
const ArrowIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
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
);

const MiniTicket = ({ variant, items, isEmpty }: MiniTicketVariantProps) => {
  if (isEmpty) {
    return (
      <div className="flex h-[100px] w-full flex-col items-center justify-center rounded-lg bg-white shadow-sm">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map(
        (
          {
            groups,
            ticket,
            trainTypeName,
            startLabel,
            endLabel,
            startAmPm,
            endAmPm,
            dotDate,
            koreanDate,
            ticketNo,
          },
          idx,
        ) => {
          if (variant === 'pc') {
            return (
              <div
                key={idx}
                className="flex w-full overflow-hidden rounded-xl bg-white shadow-md"
                style={{ minHeight: '420px' }}
              >
                {/* 티켓 정보 — 2/3 */}
                <div className="flex flex-[2] flex-col justify-between p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="w-fit rounded bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                        TRAIN
                      </span>
                      <span className="text-base font-semibold text-gray-800">
                        {trainTypeName}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-gray-400">DATE</span>
                      <span className="text-base font-semibold text-gray-800">
                        {dotDate}
                      </span>
                      <span className="text-sm text-gray-500">
                        {koreanDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-sm text-gray-400">출발역</span>
                      <span className="text-5xl font-black text-black">
                        {ticket.startStationForView}
                      </span>
                      <span className="text-base text-gray-600">
                        {startAmPm} {startLabel}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center gap-2 px-6">
                      <div className="flex items-center">
                        <div className="w-4 border-t-2 border-dashed border-gray-200" />
                        <ArrowIcon className="mx-4 h-7 w-7 text-gray-400" />
                        <div className="w-4 border-t-2 border-dashed border-gray-200" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500">
                        DIRECT
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-sm text-gray-400">도착역</span>
                      <span className="text-5xl font-black text-black">
                        {ticket.endStationForView}
                      </span>
                      <span className="text-base text-gray-600">
                        {endAmPm} {endLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-16">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-400">DEPARTURE</span>
                        <span className="text-2xl font-bold text-black">
                          {startLabel}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-400">ARRIVAL</span>
                        <span className="text-2xl font-bold text-black">
                          {endLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm text-gray-400">SEAT</span>
                      <span className="text-xl font-bold text-blue">
                        {groups.map((g) => g.seatId).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="border-l border-dashed border-gray-200" />

                {/* QR 코드 — 1/3 */}
                <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white px-6 py-8">
                  <span className="text-xs font-bold tracking-widest text-gray-400">
                    BOARDING PASS
                  </span>
                  <div className="flex flex-col items-center rounded-2xl bg-white p-2 shadow-md">
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-8">
                      <div className="h-14 w-14">
                        <QRCodePlaceholder />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold tracking-wider text-gray-400">
                      TICKET NO.
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-gray-800">
                      {ticketNo}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">
                      탑승전 QR코드를 준비해주세요.
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="w-full overflow-hidden rounded-lg bg-white shadow-md"
            >
              {/* 상단 */}
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="w-fit rounded bg-lightBlue px-2 py-0.5 text-xs font-bold text-blue">
                      TRAIN
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {trainTypeName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs text-gray-400">DATE</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {dotDate}
                    </span>
                    <span className="text-xs text-gray-500">{koreanDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs text-gray-400">출발역</span>
                    <span className="text-2xl font-black text-black">
                      {ticket.startStationForView}
                    </span>
                    <span className="text-sm text-darkGray">
                      {startAmPm} {startLabel}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col items-center gap-1 px-3">
                    <div className="flex items-center">
                      <div className="w-3 border-t-2 border-dashed border-gray-300" />
                      <ArrowIcon className="mx-2 h-4 w-4 text-gray-400" />
                      <div className="w-3 border-t-2 border-dashed border-gray-300" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      DIRECT
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs text-gray-400">도착역</span>
                    <span className="text-2xl font-black text-black">
                      {ticket.endStationForView}
                    </span>
                    <span className="text-sm text-darkGray">
                      {endAmPm} {endLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 하단 회색 */}
              <div className="flex items-center justify-between bg-gray-100 px-5 py-3">
                <div className="flex gap-10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400">DEPARTURE</span>
                    <span className="text-base font-bold text-black">
                      {startLabel}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400">ARRIVAL</span>
                    <span className="text-base font-bold text-black">
                      {endLabel}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-gray-400">SEAT</span>
                  <span className="text-base font-bold text-blue">
                    {groups.map((g) => g.seatId).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
};

export default MiniTicket;

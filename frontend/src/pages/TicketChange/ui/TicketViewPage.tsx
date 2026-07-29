import { useEffect, useRef, useState } from 'react';
import { resolveRoute, normalizeStation } from '@/shared/lib/trainRoutes';

type TicketData = {
  start: string;
  end: string;
  st: number;
  et: number;
  day: string;
  type: string;
  car: string;
  seats: string[];
  adult: number;
  kid: number;
  pay: number;
};

const parseDateTime = (st: number): Date => {
  const s = String(st);
  return new Date(
    Number(s.substring(0, 4)),
    Number(s.substring(4, 6)) - 1,
    Number(s.substring(6, 8)),
    Number(s.substring(8, 10)),
    Number(s.substring(10, 12)),
  );
};

const TicketViewPage = () => {
  const hash = window.location.hash.slice(1);
  if (!hash)
    return (
      <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
    );

  let d: TicketData;
  try {
    const normalized = hash.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    d = JSON.parse(new TextDecoder().decode(bytes)) as TicketData;
  } catch {
    return (
      <div className="p-8 text-center text-gray-400">잘못된 접근입니다.</div>
    );
  }

  return <TicketView d={d} />;
};

const TicketView = ({ d }: { d: TicketData }) => {
  const [showRoute, setShowRoute] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHH = String(d.st).substring(8, 10);
  const startMM = String(d.st).substring(10, 12);
  const endHH = String(d.et).substring(8, 10);
  const endMM = String(d.et).substring(10, 12);
  let dur =
    Number(endHH) * 60 +
    Number(endMM) -
    (Number(startHH) * 60 + Number(startMM));
  if (dur < 0) dur += 24 * 60;
  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  const departureTime = parseDateTime(d.st);
  const arrivalTime = new Date(departureTime.getTime() + dur * 60 * 1000);

  const startName = normalizeStation(d.start);
  const endName = normalizeStation(d.end);
  const { route } = resolveRoute(d.type, startName, endName);
  const startIdx = route.indexOf(startName);
  const endIdx = route.indexOf(endName);
  const segmentStations =
    startIdx !== -1 && endIdx !== -1 && startIdx < endIdx
      ? route.slice(startIdx, endIdx + 1)
      : [];

  useEffect(() => {
    if (!showRoute) return;

    const tick = () => {
      const now = Date.now();
      const total = arrivalTime.getTime() - departureTime.getTime();
      const elapsed = now - departureTime.getTime();
      setProgress(Math.min(Math.max(elapsed / total, 0), 1));
    };

    tick();
    intervalRef.current = setInterval(tick, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showRoute]);

  // 전체 노선에서 예매 구간 내 위치 (0~1)
  const trainTop = progress; // 0 = 출발역, 1 = 도착역

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl shadow-xl">
        {/* 상단: 파란 헤더 */}
        <div className="bg-blue px-5 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
              {d.type}
            </span>
            <span className="text-xs text-white/80">{d.day}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white">{d.start}</span>
              <span className="text-sm font-semibold text-white/80">
                {startHH}:{startMM}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5">
              <div className="flex w-full items-center">
                <div className="h-0 flex-1 border-t border-dashed border-white/50" />
                <span className="mx-1 inline-block -scale-x-100 text-lg leading-none">
                  🚄
                </span>
                <div className="h-0 flex-1 border-t border-dashed border-white/50" />
              </div>
              <span className="text-[10px] text-white/70">{durText}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white">{d.end}</span>
              <span className="text-sm font-semibold text-white/80">
                {endHH}:{endMM}
              </span>
            </div>
          </div>
        </div>

        {/* 절취선 */}
        <div className="flex items-center bg-white py-3">
          <div className="mx-5 flex-1 border-t-2 border-dashed border-gray-300" />
        </div>

        {/* 중단: 상세 정보 */}
        <div className="bg-white px-5 pb-4">
          <div className="flex flex-col gap-3">
            <Row
              label="호차 / 좌석"
              value={`${d.car}호차  ${d.seats.join(', ')}`}
            />
            <Row label="인원" value={`어른 ${d.adult}명 · 어린이 ${d.kid}명`} />
            <Row
              label="요금"
              value={`${d.pay.toLocaleString('ko-KR')}원`}
              bold
            />
          </div>
        </div>

        {/* 열차 구간 버튼 */}
        <div className="bg-white px-5 pb-5">
          <button
            onClick={() => setShowRoute((v) => !v)}
            className="flex w-full items-center justify-center gap-x-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-blue transition-all active:brightness-95"
          >
            <span>{showRoute ? '구간 닫기' : '열차 구간 보기'}</span>
            <span
              className="text-xs transition-transform duration-200"
              style={{
                transform: showRoute ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* 노선 표시 */}
      {showRoute && segmentStations.length > 0 && (
        <div className="mt-4 w-full max-w-sm rounded-2xl bg-white px-6 py-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">열차 구간</span>
            {progress > 0 && progress < 1 && (
              <span className="rounded-full bg-blue/10 px-2.5 py-0.5 text-xs font-bold text-blue">
                운행 중
              </span>
            )}
            {progress >= 1 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-400">
                도착 완료
              </span>
            )}
            {progress <= 0 && (
              <span className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-bold text-yellow-500">
                출발 전
              </span>
            )}
          </div>

          <div className="relative flex flex-col">
            {segmentStations.map((station, i) => {
              const stationProgress = i / (segmentStations.length - 1);
              const isPassed = progress >= stationProgress;
              const isStart = i === 0;
              const isEnd = i === segmentStations.length - 1;

              return (
                <div
                  key={station}
                  className="relative flex items-center gap-x-4"
                >
                  {/* 세로선 */}
                  {i < segmentStations.length - 1 && (
                    <div
                      className="absolute left-[11px] top-6 w-[2px]"
                      style={{
                        height: '48px',
                        backgroundColor:
                          progress >= (i + 1) / (segmentStations.length - 1)
                            ? '#2563eb'
                            : '#e5e7eb',
                      }}
                    />
                  )}

                  {/* 역 점 */}
                  <div
                    className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: isPassed ? '#2563eb' : '#e5e7eb',
                      backgroundColor: isPassed ? '#2563eb' : '#ffffff',
                    }}
                  >
                    {(isStart || isEnd) && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* 역 이름 + 시간 */}
                  <div className="flex flex-1 items-center justify-between py-3">
                    <span
                      className={`text-sm font-bold ${isPassed ? 'text-gray-800' : 'text-gray-300'}`}
                    >
                      {station}
                    </span>
                    {isStart && (
                      <span className="text-xs font-medium text-blue">
                        {startHH}:{startMM} 출발
                      </span>
                    )}
                    {isEnd && (
                      <span className="text-xs font-medium text-blue">
                        {endHH}:{endMM} 도착
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 열차 아이콘 (운행 중일 때만) */}
            {progress > 0 && progress < 1 && (
              <div
                className="pointer-events-none absolute left-[-2px] z-20 transition-all duration-[10000ms] ease-linear"
                style={{
                  top: `${12 + trainTop * ((segmentStations.length - 1) * 54)}px`,
                }}
              >
                <span className="inline-block -scale-x-100 text-xl">🚄</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showRoute && segmentStations.length === 0 && (
        <div className="mt-4 w-full max-w-sm rounded-2xl bg-white px-6 py-5 shadow-xl">
          <span className="text-sm text-gray-400">
            해당 열차 노선 정보를 찾을 수 없습니다.
          </span>
        </div>
      )}
    </div>
  );
};

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <span
      className={`text-sm ${bold ? 'font-bold text-blue' : 'font-semibold text-gray-800'}`}
    >
      {value}
    </span>
  </div>
);

export default TicketViewPage;

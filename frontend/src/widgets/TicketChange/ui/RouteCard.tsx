/**
 * @role: widgets — 구간 카드 UI 컴포넌트
 * @rule: 목록/지도 전환 상태와 진행률은 내부 관리, 외부 비즈니스 로직 포함 금지
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { stationCoords } from '@/shared/lib/stationCoords';
import { CustomOverlayMap, Map, Polyline } from 'react-kakao-maps-sdk';
import { RouteCardProps } from '../types/RouteCardType';

const TrainPing = ({
  coords,
  departureMs,
  arrivalMs,
}: {
  coords: { lat: number; lng: number }[];
  departureMs: number;
  arrivalMs: number;
}) => {
  const [trainPos, setTrainPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      // 현재 운행 진행률 계산 (0~1)
      const now = Date.now();
      const total = arrivalMs - departureMs;
      const elapsed = now - departureMs;
      const p = Math.min(Math.max(elapsed / total, 0), 1);
      if (p <= 0 || p >= 1 || coords.length < 2) {
        setTrainPos(null);
        return;
      }
      // 두 역 사이 좌표 보간으로 열차 위치 계산
      const idx = p * (coords.length - 1);
      const i = Math.floor(idx);
      const t = idx - i;
      const a = coords[Math.min(i, coords.length - 1)];
      const b = coords[Math.min(i + 1, coords.length - 1)];
      setTrainPos({
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      });
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [coords, departureMs, arrivalMs]);

  if (!trainPos) return null;
  return (
    <CustomOverlayMap position={trainPos}>
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[8px]">
          🚄
        </span>
      </span>
    </CustomOverlayMap>
  );
};

const StationMarker = ({
  coord,
  station,
  index,
  total,
  departureMs,
  arrivalMs,
  isStart,
  isEnd,
}: {
  coord: { lat: number; lng: number };
  station: string;
  index: number;
  total: number;
  departureMs: number;
  arrivalMs: number;
  isStart: boolean;
  isEnd: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  // 역별 예상 시간 계산
  const stationTime = new Date(
    departureMs + (index / (total - 1)) * (arrivalMs - departureMs),
  );
  const hh = String(stationTime.getHours()).padStart(2, '0');
  const mm = String(stationTime.getMinutes()).padStart(2, '0');
  const timeLabel = isStart
    ? `${hh}:${mm} 출발`
    : isEnd
      ? `${hh}:${mm} 도착`
      : `${hh}:${mm} 경유`;

  return (
    <CustomOverlayMap position={coord} xAnchor={0.5} yAnchor={0.5}>
      <div
        className="relative flex flex-col items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 말풍선 */}
        {hovered && (
          <div className="absolute bottom-full mb-1 flex min-w-max flex-col items-center">
            <div className="rounded-lg bg-gray-800 px-2.5 py-1.5 shadow-lg">
              <p className="text-xs font-bold text-white">{station}</p>
              <p className="text-[10px] text-gray-300">{timeLabel}</p>
            </div>
            {/* 말풍선 꼬리 */}
            <div className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-gray-800" />
          </div>
        )}
        {/* 마커 아이콘 */}
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-md ${
            isStart || isEnd ? 'bg-blue' : 'bg-white'
          }`}
        >
          {isStart || isEnd ? (
            <div className="h-2 w-2 rounded-full bg-white" />
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-blue" />
          )}
        </div>
      </div>
    </CustomOverlayMap>
  );
};

const RouteMap = memo(
  ({
    stations,
    departureMs,
    arrivalMs,
  }: {
    stations: string[];
    departureMs: number;
    arrivalMs: number;
  }) => {
    const coords = useMemo(
      () => stations.map((st) => stationCoords[st]).filter(Boolean),
      [stations],
    );
    const midCoord = coords[Math.floor(coords.length / 2)] ?? coords[0];

    if (!midCoord) return null;

    return (
      <div className="min-h-0 flex-1 overflow-hidden rounded-b-2xl">
        <Map
          center={midCoord}
          style={{ width: '100%', height: '100%', minHeight: '200px' }}
          onCreate={(map) => {
            if (coords.length < 2) return;
            const bounds = new window.kakao.maps.LatLngBounds();
            coords.forEach((c) =>
              bounds.extend(new window.kakao.maps.LatLng(c.lat, c.lng)),
            );
            map.setBounds(bounds, 60);
          }}
        >
          <Polyline
            path={coords}
            strokeWeight={4}
            strokeColor="#2563eb"
            strokeOpacity={0.9}
            strokeStyle="solid"
          />
          {coords.map((coord, i) => (
            <StationMarker
              key={i}
              coord={coord}
              station={stations[i]}
              index={i}
              total={stations.length}
              departureMs={departureMs}
              arrivalMs={arrivalMs}
              isStart={i === 0}
              isEnd={i === stations.length - 1}
            />
          ))}
          <TrainPing
            coords={coords}
            departureMs={departureMs}
            arrivalMs={arrivalMs}
          />
        </Map>
      </div>
    );
  },
);

RouteMap.displayName = 'RouteMap';

const RouteCard = ({
  s,
  segmentStations,
  departure,
  arrival,
  dur,
  durText,
}: RouteCardProps) => {
  const [mapView, setMapView] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 10초마다 열차 진행률 갱신
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const total = arrival.getTime() - departure.getTime();
      const elapsed = now - departure.getTime();
      setProgress(Math.min(Math.max(elapsed / total, 0), 1));
    };
    tick();
    intervalRef.current = setInterval(tick, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [departure, arrival]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md">
      {/* 파란 헤더 */}
      <div className="rounded-t-xl bg-blue px-5 pb-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white">
            {s.startStationForView}
          </span>
          <span className="text-white/60">→</span>
          <span className="text-base font-black text-white">
            {s.endStationForView}
          </span>
          <span className="text-xs text-white/70">{durText}</span>
          <button
            onClick={() => setMapView((v) => !v)}
            className="ml-auto rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold text-white transition-all active:brightness-90"
          >
            {mapView ? '목록' : '지도'}
          </button>
        </div>
      </div>

      {/* 목록 뷰 */}
      {!mapView && (
        <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
          {segmentStations.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-sm text-gray-400">
                구간 정보가 없습니다.
              </span>
            </div>
          ) : null}
          {segmentStations.map((station, i) => {
            // 역별 진행률 비교로 통과 여부 결정
            const stationProgress = i / (segmentStations.length - 1);
            const isPassed = progress >= stationProgress;
            const isStart = i === 0;
            const isEnd = i === segmentStations.length - 1;
            return (
              <div
                key={station}
                className={`flex flex-col ${!isEnd ? 'flex-1' : ''}`}
              >
                <div className="flex items-center gap-x-3">
                  <div
                    className="z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: isPassed ? '#2563eb' : '#e5e7eb',
                      backgroundColor: isPassed ? '#2563eb' : '#ffffff',
                    }}
                  >
                    {(isStart || isEnd) && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <span
                      className={`text-sm font-bold ${isPassed ? 'text-gray-800' : 'text-gray-300'}`}
                    >
                      {station}
                    </span>
                    <span
                      className={`text-xs font-medium ${isPassed ? 'text-blue' : 'text-gray-300'}`}
                    >
                      {(() => {
                        const t = new Date(
                          departure.getTime() +
                            (i / (segmentStations.length - 1)) *
                              dur *
                              60 *
                              1000,
                        );
                        const hh = String(t.getHours()).padStart(2, '0');
                        const mm = String(t.getMinutes()).padStart(2, '0');
                        return isStart
                          ? `${hh}:${mm} 출발`
                          : isEnd
                            ? `${hh}:${mm} 도착`
                            : `${hh}:${mm}`;
                      })()}
                    </span>
                  </div>
                </div>
                {!isEnd &&
                  (() => {
                    // 현재 구간 내 세부 진행률 계산 (ping 위치 결정)
                    const segStart = i / (segmentStations.length - 1);
                    const segEnd = (i + 1) / (segmentStations.length - 1);
                    const inSegment = progress > segStart && progress < segEnd;
                    const segProgress = inSegment
                      ? (progress - segStart) / (segEnd - segStart)
                      : 0;
                    return (
                      <div className="relative ml-[7px] w-[2px] flex-1 bg-[#e5e7eb]">
                        {/* 파란 진행선 */}
                        <div
                          className="absolute left-0 top-0 w-full"
                          style={{
                            height: inSegment
                              ? `${segProgress * 100}%`
                              : progress >= segEnd
                                ? '100%'
                                : '0%',
                            backgroundColor: '#2563eb',
                          }}
                        />
                        {/* 이동 중 ping */}
                        {inSegment && (
                          <div
                            className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                            style={{ top: `${segProgress * 100}%` }}
                          >
                            <span className="relative flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-75" />
                              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue" />
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            );
          })}
        </div>
      )}

      {/* 지도 뷰 */}
      {mapView &&
        (segmentStations.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-sm text-gray-400">지도 정보가 없습니다.</span>
          </div>
        ) : (
          <RouteMap
            stations={segmentStations}
            departureMs={departure.getTime()}
            arrivalMs={arrival.getTime()}
          />
        ))}
    </div>
  );
};

export default RouteCard;

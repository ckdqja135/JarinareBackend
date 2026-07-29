/**
 * @role: features — 티켓 상세 데이터 가공 Hook
 * @rule: UI 렌더링 로직 포함 금지, 데이터 가공만 담당
 */
import { useMemo } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { parseDateTime } from '@/shared/lib/formatDate';
import { resolveRoute, normalizeStation } from '@/shared/lib/trainRoutes';

export const useTicketDetail = (seats: SeatType[]) => {
  const s = seats[0];

  // 출발/도착 시각 파싱
  const startHH = String(s.startTime).substring(8, 10);
  const startMM = String(s.startTime).substring(10, 12);
  const endHH = String(s.endTime).substring(8, 10);
  const endMM = String(s.endTime).substring(10, 12);

  // 소요시간 계산 (분 단위, 자정 넘김 보정)
  let dur =
    Number(endHH) * 60 +
    Number(endMM) -
    (Number(startHH) * 60 + Number(startMM));
  if (dur < 0) dur += 24 * 60;

  const durText =
    dur >= 60
      ? `${Math.floor(dur / 60)}시간 ${dur % 60 > 0 ? `${dur % 60}분` : ''}`
      : `${dur}분`;

  const { departure, arrival } = parseDateTime(s.startTime, dur);

  const filtred = useMemo(() => seats.map((seat) => seat.seatId), [seats]);

  // 열차 노선에서 출발~도착 구간 역 추출
  const segmentStations = useMemo(() => {
    const startName = normalizeStation(s.startStationForView);
    const endName = normalizeStation(s.endStationForView);
    const { route } = resolveRoute(s.trainType, startName, endName);
    // 정확한 매칭 실패 시 부분 문자열로 fallback
    const findIdx = (name: string) => {
      const exact = route.indexOf(name);
      if (exact !== -1) return exact;
      return route.findIndex((r) => r.includes(name) || name.includes(r));
    };
    const startIdx = findIdx(startName);
    const endIdx = findIdx(endName);
    if (startIdx === -1 || endIdx === -1) return [];
    return startIdx < endIdx
      ? route.slice(startIdx, endIdx + 1)
      : route.slice(endIdx, startIdx + 1).reverse();
  }, [seats]);

  // 티켓 정보를 URL-safe Base64로 인코딩하여 QR URL 생성
  const qrValue = useMemo(() => {
    const payload = JSON.stringify({
      start: s.startStationForView,
      end: s.endStationForView,
      st: s.startTime,
      et: s.endTime,
      day: s.startDayForView,
      type: s.trainType,
      car: s.trainNoId,
      seats: filtred,
      adult: s.selectAdult,
      kid: s.selectKid,
      pay: s.selectPay,
    });
    const bytes = new TextEncoder().encode(payload);
    const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `${window.location.origin}/ticket/view#${b64}`;
  }, [seats, filtred]);

  return {
    s,
    filtred,
    segmentStations,
    qrValue,
    startHH,
    startMM,
    endHH,
    endMM,
    dur,
    durText,
    departure,
    arrival,
  };
};

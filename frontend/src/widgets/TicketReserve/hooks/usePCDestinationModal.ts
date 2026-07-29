/**
 * @role: widgets — PC 추천여행지 모달 기차 조회 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchAllStations } from '@/features/TicketReserve/api/station';
import { getTimeByStation } from '@/features/TicketReserve/api/trainTime';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import {
  formatDate,
  formatDateForView,
  formatTodayDate,
} from '@/shared/lib/formatDate';
import {
  CITY_STATION_MAP,
  CITY_ROUTES,
} from '../constants/PCDestinationConstants';
import type { TrainTimeProps } from '@/features/TicketReserve/types/stationType';
import { formatTrainGradeName } from '@/shared/lib/formatTrainName';

const addDays = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

export const buildDateOptions = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = addDays(i);
    return {
      date: formatDate(d),
      label: formatDateForView(d),
      isToday: i === 0,
    };
  });

export const usePCDestinationModal = (city: string) => {
  const navigate = useNavigate();

  const dateOptions = buildDateOptions();
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].date);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartureName, setSelectedDepartureName] = useState('');
  const [pendingTrain, setPendingTrain] = useState<{
    train: TrainTimeProps[number];
    leg: { from: string; to: string };
  } | null>(null);

  const selectedDateLabel =
    dateOptions.find((d) => d.date === selectedDate)?.label ?? '';

  const {
    adult,
    kid,
    setStartStation,
    setEndStation,
    setStartStationForView,
    setEndStationForView,
    setStartDay,
    setStartDayForView,
    setSelectStartTime,
    setSelectEndTime,
    setSelectTrainType,
    setSelectAdult,
    setSelectKid,
    setSelectPay,
    setTrainNo,
  } = trainDataStore();

  const { data: stations = [] } = useQuery({
    queryKey: ['station'],
    queryFn: fetchAllStations,
    gcTime: 24 * 60 * 60 * 1000,
    staleTime: 12 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 역 이름 검색 자동완성
  const suggestions = useMemo(() => {
    if (searchQuery.length < 1) return [];
    return stations.filter((s) => s.nodename.includes(searchQuery)).slice(0, 6);
  }, [searchQuery, stations]);

  const findStationId = (name: string): string | undefined => {
    return stations.find(
      (s) =>
        s.nodename === name ||
        s.nodename.includes(name) ||
        name.includes(s.nodename),
    )?.nodeid;
  };

  const destStationName = CITY_STATION_MAP[city] ?? city;

  // 선택한 출발지부터의 구간만 추출
  const routes = CITY_ROUTES[city] ?? [];
  const startIdx = routes.findIndex((r) => r.from === selectedDepartureName);
  const visibleRoutes = startIdx >= 0 ? routes.slice(startIdx) : [];

  const now = formatTodayDate();
  const today = formatDate(new Date());

  // 구간별 병렬 기차 조회
  const legQueries = useQueries({
    queries: visibleRoutes.map((leg) => {
      const fromId = findStationId(leg.from);
      const toId = findStationId(leg.to);
      return {
        queryKey: ['trainTime', fromId, toId, selectedDate, ''],
        queryFn: () => getTimeByStation(fromId!, toId!, selectedDate),
        enabled: !!(fromId && toId && stations.length > 0),
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      };
    }),
  });

  // 구간별 첫 번째 열차 체이닝 — 이전 구간 도착 시간 이후의 열차만 허용
  const legTrains = visibleRoutes.reduce<
    {
      leg: (typeof visibleRoutes)[number];
      nextTrain: TrainTimeProps[number] | null;
      isFetching: boolean;
    }[]
  >((acc, leg, i) => {
    const rawTrains = (legQueries[i]?.data ?? []) as TrainTimeProps;

    // 첫 구간은 현재 시간, 이후 구간은 직전 구간 도착 시간 기준
    const prevArrival = i === 0 ? null : acc[i - 1]?.nextTrain?.arrplandtime;
    const threshold =
      i === 0 ? (selectedDate === today ? now : 0) : (prevArrival ?? null);

    const nextTrain =
      threshold !== null
        ? (rawTrains.find((t) => t.depplandtime >= threshold) ?? null)
        : (rawTrains[0] ?? null);

    acc.push({ leg, nextTrain, isFetching: legQueries[i]?.isFetching ?? true });
    return acc;
  }, []);

  const handleTrainClick = (
    train: TrainTimeProps[number],
    leg: { from: string; to: string },
  ) => {
    setPendingTrain((prev) => (prev?.train === train ? null : { train, leg }));
  };

  const handleConfirmPassengers = () => {
    if (!pendingTrain || adult + kid === 0) return;
    const { train, leg } = pendingTrain;
    const fromId = findStationId(leg.from);
    const toId = findStationId(leg.to);
    if (!fromId || !toId) return;

    setStartStation(fromId);
    setEndStation(toId);
    setStartStationForView(leg.from);
    setEndStationForView(leg.to);
    setStartDay(selectedDate);
    setStartDayForView(selectedDateLabel);
    setSelectStartTime(train.depplandtime);
    setSelectEndTime(train.arrplandtime);
    setSelectTrainType(`${train.traingradename}-${train.trainno}`);
    setTrainNo('1');
    setSelectAdult(adult);
    setSelectKid(kid);
    setSelectPay(train.adultcharge);

    navigate('/reserve/seatcheck');
  };

  const handleClosePendingTrain = () => setPendingTrain(null);

  const handleSelectSuggestion = (name: string) => {
    setSelectedDepartureName(name);
    setSearchQuery('');
  };

  const legTrainsWithDisplay = legTrains.map((item) => ({
    ...item,
    trainGradeDisplay: item.nextTrain
      ? formatTrainGradeName(item.nextTrain.traingradename)
      : null,
  }));

  return {
    legTrains: legTrainsWithDisplay,
    handleTrainClick,
    handleConfirmPassengers,
    handleClosePendingTrain,
    pendingTrain,
    destStationName,
    selectedDepartureName,
    searchQuery,
    setSearchQuery,
    suggestions,
    handleSelectSuggestion,
    dateOptions,
    selectedDate,
    setSelectedDate,
    selectedDateLabel,
    adult,
    kid,
  };
};

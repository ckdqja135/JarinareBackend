import { useQuery } from '@tanstack/react-query';
import { QueryDataProps } from '../types/stationType';
import { trainDataStore } from '../model/trainDataStore';
import { fetchAllStations } from '../api/station';
import { getTimeByStation } from '../api/trainTime';

export const trainQueryData = (): QueryDataProps => {
  const { startStation, endStation, startDay, trainType } = trainDataStore();

  // 역 정보 조회
  const stationQuery = useQuery({
    queryKey: ['station'],
    queryFn: fetchAllStations,
    gcTime: 24 * 60 * 60 * 1000, // 24시간 캐시
    staleTime: 12 * 60 * 60 * 1000, // 12시간 동안 fresh 상태 유지
    refetchOnWindowFocus: false, // 창을 다시 포커스해도 자동 호출 방지
  });

  // 기차 시간 조회
  const trainTimeQuery = useQuery({
    queryKey: ['trainTime', startStation, endStation, startDay, trainType],
    queryFn: () =>
      getTimeByStation(
        startStation,
        endStation,
        startDay,
        trainType || undefined,
      ),
    // 필수 파라미터가 있을 때만 자동 실행
    enabled: !!(
      startStation &&
      endStation &&
      startDay &&
      startStation !== endStation
    ),
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000, // 5분간 fresh → 같은 구간 재조회 시 캐시 사용
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 캐시가 fresh하면 재마운트 시 재요청 안 함
    refetchOnReconnect: false, // 네트워크 재얀결 시 자동 호출 방지
    retry: 1, // 실패 시 1회 재시도
    retryDelay: 3000, // 재시도 전 3초 대기
  });

  return {
    stations: stationQuery.data || [],
    trainTime: trainTimeQuery.data || [],
    isLoading: stationQuery.isLoading,
    isFetching: trainTimeQuery.isFetching,
    refetch: trainTimeQuery.refetch,
  };
};

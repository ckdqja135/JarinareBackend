import { useQueryClient } from '@tanstack/react-query';
import { trainDataStore } from '../model/trainDataStore';

// 전역 refetch 제어 (더 강화)
let globalRefetchLock = false; // 현재 refetch 중인지 여부
let lastRefetchParams = ''; // 마지막으로 호출한 파라미터
let globalDebounceTimeout: NodeJS.Timeout | null = null; // 디바운스 타이머
let refetchCount = 0; // 호출 횟수 추적

export const useTrainRefetch = () => {
  const queryClient = useQueryClient();

  const refetchTrainTime = async (force = false) => {
    refetchCount++;
    const callId = refetchCount;

    const { startStation, endStation, startDay, trainType } =
      trainDataStore.getState();

    // 필수 파라미터가 없으면 무시
    if (
      !startStation ||
      !endStation ||
      !startDay ||
      startStation === endStation
    ) {
      return;
    }

    // 파라미터 조합으로 중복 체크
    const currentParams = `${startStation}-${endStation}-${startDay}-${trainType || ''}`;

    // force가 true가 아니고, 이미 refetch 중이거나 같은 파라미터로 최근에 호출했으면 무시
    if (!force && (globalRefetchLock || lastRefetchParams === currentParams)) {
      return;
    }

    // 이전 디바운스 타이머 취소
    if (globalDebounceTimeout) {
      clearTimeout(globalDebounceTimeout);
    }

    // 디바운싱 적용 (force면 즉시 실행, 아니면 500ms 후)
    const delay = force ? 0 : 500;
    globalDebounceTimeout = setTimeout(async () => {
      try {
        globalRefetchLock = true;
        lastRefetchParams = currentParams;

        // 특정 쿼리 키로 refetch
        await queryClient.refetchQueries({
          queryKey: [
            'trainTime',
            startStation,
            endStation,
            startDay,
            trainType,
          ],
          type: 'active',
        });
      } catch (error) {
        console.error(`❌ API 호출 실패 #${callId}:`, error);
      } finally {
        globalRefetchLock = false;
        // 5초 후 파라미터 캐시 초기화 (같은 파라미터로 재호출 허용)
        setTimeout(() => {
          lastRefetchParams = '';
        }, 5000);
      }
    }, delay);
  };

  return { refetch: refetchTrainTime };
};

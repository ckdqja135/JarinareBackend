// @role: features — 좌석 선택·잠금·예매 상태 관리
// @rule: api/ 호출만 담당, Firestore/RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { trainDataStore } from '../model/trainDataStore';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateStore } from '../model/seatsStateStore';
import { seatsStateCountStore } from '../model/seatsStateCountStore';
import { useNavigate } from 'react-router-dom';
import { seatsInfoStore } from '../model/seatsInfoStore';
import {
  getCachedAllSeats,
  useAllSeatsInfo,
  clearAllSeatsCache,
  prefetchAllSeats,
} from './useAllSeatsInfo';

export const useSeatQueryData = () => {
  const {
    startDay,
    trainNo,
    selectStartTime,
    selectTrainType,
    selectAdult,
    selectKid,
    startStationForView,
    endStationForView,
  } = trainDataStore();

  const { seatsState, setSeatsState } = seatsStateStore();
  const { seatsInfo, setSeatsInfo } = seatsInfoStore();
  const [seatsAllInfo, setSeatAllInfo] =
    useState<SeatType[]>(getCachedAllSeats());

  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();

  // 잠긴 좌석의 초기 렌더링 상태 (useQuery isFetched로 대체됨)
  // 좌석 중복 클릭 방지
  const isSelectingRef = useRef<Record<string, boolean>>({});
  // 좌석 연속 클릭 방지
  const [isMutating, setIsMutating] = useState(false);

  const navigate = useNavigate();

  const user = auth.currentUser;
  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}_${startStationForView}_${endStationForView}`;

  // 선택된 좌석 수
  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 각 호차별 좌석 상태 — 동일 쿼리키면 7개 컴포넌트가 공유하여 요청 1번만 발생
  const { data: seatsQueryData } = useQuery({
    queryKey: ['current-seats', docIds, trainNo],
    queryFn: async () => {
      const { data } = await backendClient.get<SeatType[]>('/api/seats', {
        params: { docId: docIds, trainNoId: trainNo },
      });
      return data;
    },
    enabled: !!trainNo && !!docIds,
    staleTime: 0,
  });

  useEffect(() => {
    setSeatsInfo(seatsQueryData ?? []);
  }, [seatsQueryData]);

  // 캐시된 데이터가 업데이트되면 상태에 반영
  useAllSeatsInfo((seats) => setSeatAllInfo(seats));

  // 상대방 좌석 잠금 — 동일 쿼리키로 중복 요청 제거
  const { data: locksQueryData, isFetched: locksIsFetched } = useQuery({
    queryKey: ['seat-locks', docIds, trainNo],
    queryFn: async () => {
      const { data } = await backendClient.get<Record<string, string>>(
        '/api/seat-locks',
        { params: { docId: docIds, trainNoId: trainNo } },
      );
      return Object.fromEntries(
        Object.entries(data).filter(([, uid]) => uid !== user?.uid),
      );
    },
    enabled: !!trainNo && !!docIds,
    staleTime: 0,
  });

  const locks = locksQueryData ?? {};
  const isLocksLoaded = locksIsFetched;

  // 선택된 좌석 TTL 갱신 (heartbeat)
  useEffect(() => {
    if (!user || !trainNo) return;

    const intervalId = setInterval(async () => {
      const selectedSeatIds = Object.entries(seatsState)
        .filter(([, v]) => v === true)
        .map(([seatId]) => seatId);

      await Promise.all(
        selectedSeatIds.map((seatId) =>
          backendClient
            .post('/api/seat-locks/heartbeat', {
              lockKey: `${docIds}/${trainNo}/${seatId}`,
            })
            .catch(() => {}),
        ),
      );
    }, 20000);

    return () => clearInterval(intervalId);
  }, [seatsState, user, docIds, trainNo]);

  // 좌석 잠금
  const lockSeat = async (seatId: string): Promise<boolean> => {
    if (!user) return false;
    const lockKey = `${docIds}/${trainNo}/${seatId}`;
    try {
      await backendClient.post('/api/seat-locks', { lockKey });
      return true;
    } catch {
      return false;
    }
  };

  // 좌석 잠금 해제
  const unlockSeat = async (seatId: string) => {
    const lockKey = `${docIds}/${trainNo}/${seatId}`;
    try {
      await backendClient.delete('/api/seat-locks', { params: { lockKey } });
    } catch {}
  };

  const handleSingleSelect = async (id: string) => {
    if (!user) return;

    if (isSelectingRef.current[id]) return;
    isSelectingRef.current[id] = true;
    try {
      // 선택할려는 좌석이 이미 예매된 좌석(본인 포함)이면 선택 불가
      const isMineOrOthers = seatsInfo.some(
        (item) => item.trainNoId === trainNo && item.seatId === id,
      );
      if (isMineOrOthers) return;

      const isSelected = seatsState[id] === true;

      // 선택한 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        await unlockSeat(id);
        return;
      }

      // 선택 인원 수 제한
      if (selectedCount >= selectAdult + selectKid) return;

      // 잠금을 먼저 시도하고, 성공한 경우에만 로컬 상태 업데이트
      const lockSuccess = await lockSeat(id);
      if (lockSuccess) {
        setSeatsState({ ...seatsState, [id]: true });
      }
    } finally {
      isSelectingRef.current[id] = false;
    }
  };

  const handleAllSelect = async () => {
    if (!isLocksLoaded) return;
    if (isMutating) return;
    setIsMutating(true);

    // 빈 좌석이 선택할 좌석 만큼 없으면 선택 막기
    const reservedSeatIds = seatsInfo.map((id) => id.seatId);

    // 다른 사용자의 잠금된 좌석
    const lockedSeatIds = Object.keys(locks);

    const isAllSelectedCount = selectKid + selectAdult;

    if (24 - reservedSeatIds.length - lockedSeatIds.length < isAllSelectedCount)
      return;

    const rows = ['A', 'B', 'C', 'D'];
    const columns = [1, 2, 3, 4, 5, 6];

    // 사용 가능한 좌석 확인 함수
    const isAvailable = (seatId: string): boolean => {
      return (
        !reservedSeatIds.includes(seatId) &&
        !lockedSeatIds.includes(seatId) &&
        !seatsState[seatId]
      );
    };

    let selectedSeatIds: string[] = [];

    // 2인: 같은 열에서 인접한 두 행 (예: A1 B1)
    if (isAllSelectedCount === 2) {
      for (const col of columns) {
        // A-B 쌍
        const seatA = `A${col}`;
        const seatB = `B${col}`;
        if (isAvailable(seatA) && isAvailable(seatB)) {
          selectedSeatIds = [seatA, seatB];
          break;
        }
        // B-C 쌍
        const seatB2 = `B${col}`;
        const seatC = `C${col}`;
        if (isAvailable(seatB2) && isAvailable(seatC)) {
          selectedSeatIds = [seatB2, seatC];
          break;
        }
        // C-D 쌍
        const seatC2 = `C${col}`;
        const seatD = `D${col}`;
        if (isAvailable(seatC2) && isAvailable(seatD)) {
          selectedSeatIds = [seatC2, seatD];
          break;
        }
      }
    }
    // 3인: ㄱ자 형태 (예: A1 B1 A2)
    else if (isAllSelectedCount === 3) {
      for (const col of columns) {
        if (col >= 6) continue;

        // A1 B1 A2 형태
        const seatA1 = `A${col}`;
        const seatB1 = `B${col}`;
        const seatA2 = `A${col + 1}`;
        if (isAvailable(seatA1) && isAvailable(seatB1) && isAvailable(seatA2)) {
          selectedSeatIds = [seatA1, seatB1, seatA2];
          break;
        }

        // B1 C1 B2 형태
        const seatB1_2 = `B${col}`;
        const seatC1 = `C${col}`;
        const seatB2 = `B${col + 1}`;
        if (
          isAvailable(seatB1_2) &&
          isAvailable(seatC1) &&
          isAvailable(seatB2)
        ) {
          selectedSeatIds = [seatB1_2, seatC1, seatB2];
          break;
        }

        // C1 D1 C2 형태
        const seatC1_2 = `C${col}`;
        const seatD1 = `D${col}`;
        const seatC2 = `C${col + 1}`;
        if (
          isAvailable(seatC1_2) &&
          isAvailable(seatD1) &&
          isAvailable(seatC2)
        ) {
          selectedSeatIds = [seatC1_2, seatD1, seatC2];
          break;
        }

        // A1 B1 B2 형태 (다른 ㄱ자 형태)
        const seatA1_2 = `A${col}`;
        const seatB1_3 = `B${col}`;
        const seatB2_2 = `B${col + 1}`;
        if (
          isAvailable(seatA1_2) &&
          isAvailable(seatB1_3) &&
          isAvailable(seatB2_2)
        ) {
          selectedSeatIds = [seatA1_2, seatB1_3, seatB2_2];
          break;
        }
      }
    }
    // 4인: ㅁ자 형태 2x2 정사각형 (예: A1 B1 A2 B2)
    else if (isAllSelectedCount === 4) {
      for (const col of columns) {
        if (col >= 6) continue;

        // A1 B1 A2 B2 형태
        const seatA1 = `A${col}`;
        const seatB1 = `B${col}`;
        const seatA2 = `A${col + 1}`;
        const seatB2 = `B${col + 1}`;
        if (
          isAvailable(seatA1) &&
          isAvailable(seatB1) &&
          isAvailable(seatA2) &&
          isAvailable(seatB2)
        ) {
          selectedSeatIds = [seatA1, seatB1, seatA2, seatB2];
          break;
        }

        // B1 C1 B2 C2 형태
        const seatB1_4 = `B${col}`;
        const seatC1_3 = `C${col}`;
        const seatB2_3 = `B${col + 1}`;
        const seatC2 = `C${col + 1}`;
        if (
          isAvailable(seatB1_4) &&
          isAvailable(seatC1_3) &&
          isAvailable(seatB2_3) &&
          isAvailable(seatC2)
        ) {
          selectedSeatIds = [seatB1_4, seatC1_3, seatB2_3, seatC2];
          break;
        }

        // C1 D1 C2 D2 형태
        const seatC1_4 = `C${col}`;
        const seatD1_2 = `D${col}`;
        const seatC2_2 = `C${col + 1}`;
        const seatD2 = `D${col + 1}`;
        if (
          isAvailable(seatC1_4) &&
          isAvailable(seatD1_2) &&
          isAvailable(seatC2_2) &&
          isAvailable(seatD2)
        ) {
          selectedSeatIds = [seatC1_4, seatD1_2, seatC2_2, seatD2];
          break;
        }
      }
    }
    // 5인 이상: 최대한 붙어있는 형태로 선택 (우선순위: 2x2 + 추가 좌석)
    else {
      for (const col of columns) {
        if (col >= 6) continue;

        const seatA1 = `A${col}`;
        const seatB1 = `B${col}`;
        const seatA2 = `A${col + 1}`;
        const seatB2 = `B${col + 1}`;

        if (
          isAvailable(seatA1) &&
          isAvailable(seatB1) &&
          isAvailable(seatA2) &&
          isAvailable(seatB2)
        ) {
          selectedSeatIds = [seatA1, seatB1, seatA2, seatB2];

          const remaining = isAllSelectedCount - 4;
          if (remaining > 0) {
            const candidates = [
              `A${col + 2}`,
              `B${col + 2}`,
              `A${col - 1}`,
              `B${col - 1}`,
              `C${col}`,
              `C${col + 1}`,
            ].filter((id) => {
              const match = id.match(/^([A-D])(\d+)$/);
              if (!match) return false;
              const row = match[1];
              const colNum = parseInt(match[2]);
              return (
                rows.includes(row) &&
                colNum >= 1 &&
                colNum <= 6 &&
                isAvailable(id) &&
                !selectedSeatIds.includes(id)
              );
            });

            for (let i = 0; i < remaining && i < candidates.length; i++) {
              selectedSeatIds.push(candidates[i]);
            }
          }

          if (selectedSeatIds.length === isAllSelectedCount) break;
        }
      }
    }

    // 패턴으로 찾지 못한 경우, 기존 랜덤 방식으로 fallback
    if (selectedSeatIds.length < isAllSelectedCount) {
      selectedSeatIds = [];
      const allRows = ['A', 'B', 'C', 'D'];
      const allColumns = [1, 2, 3, 4, 5, 6];

      const availableSeats: string[] = [];
      for (const row of allRows) {
        for (const col of allColumns) {
          const seatId = `${row}${col}`;
          if (isAvailable(seatId)) {
            availableSeats.push(seatId);
          }
        }
      }

      while (
        selectedSeatIds.length < isAllSelectedCount &&
        availableSeats.length > 0
      ) {
        const randomIndex = Math.floor(Math.random() * availableSeats.length);
        selectedSeatIds.push(availableSeats[randomIndex]);
        availableSeats.splice(randomIndex, 1);
      }
    }

    // 순회한 좌석들을 newState에 저장 및 잠금
    const multipleSeatsState = { ...seatsState };
    for (const id of selectedSeatIds) {
      multipleSeatsState[id] = true;
      await lockSeat(id);
    }
    // 여러 좌석들을 한 번에 선택
    setSeatsState(multipleSeatsState);
    setIsMutating(false);
  };

  const prevTrainNoRef = useRef<string | undefined>(trainNo);

  // 호차 변경 시 이전 호차의 잠금 해제
  useEffect(() => {
    const previousTrainNo = prevTrainNoRef.current;

    if (previousTrainNo !== undefined && previousTrainNo !== trainNo) {
      const unlockPreviousTrainNo = async () => {
        if (!user) return;

        const prevState = seatsStateStore.getState().seatsState;
        const myLockedSeats = Object.entries(prevState)
          .filter(([, v]) => v === true)
          .map(([seatId]) => seatId);

        await Promise.all(
          myLockedSeats.map((seatId) =>
            backendClient
              .delete('/api/seat-locks', {
                params: {
                  lockKey: `${docIds}/${previousTrainNo}/${seatId}`,
                },
              })
              .catch(() => {}),
          ),
        );
      };

      unlockPreviousTrainNo();
    }

    prevTrainNoRef.current = trainNo;
  }, [trainNo, docIds, user]);

  useEffect(() => {
    // 선택한 좌석 즉시 반영
    setSeatsStateCount(selectedCount);
  }, [seatsState]);

  const createSelectedSeats = async (calculatedPay: number) => {
    if (!user) return;
    if (isMutating) return;
    setIsMutating(true);

    // 좌석페이지 진입 후 결제 버튼 클릭 시 타이밍으로 인해 빈 값이 들어올 수 있으므로 getState로 즉시 호출
    const currentSeatsState = seatsStateStore.getState().seatsState;
    const filtered = Object.entries(currentSeatsState)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    // 선택된 좌석 없으면 저장하지 않음
    if (filtered.length === 0) {
      setIsMutating(false);
      return;
    }

    const {
      startDay: currentStartDay,
      selectStartTime: currentSelectStartTime,
      selectEndTime: currentSelectEndTime,
      selectTrainType: currentSelectTrainType,
      trainNo: currentTrainNo,
      startDayForView: currentStartDayForView,
      startStationForView: currentStartStationForView,
      endStationForView: currentEndStationForView,
      selectKid: currentSelectKid,
      selectAdult: currentSelectAdult,
    } = trainDataStore.getState();

    const currentDocIds = `${currentStartDay}_${currentSelectStartTime}_${currentSelectTrainType}_${currentStartStationForView}_${currentEndStationForView}`;

    try {
      await Promise.all(
        filtered.map((seatId) =>
          backendClient.post('/api/seats/reservations', {
            seatId,
            trainNoId: currentTrainNo,
            startDay: currentStartDay,
            startTime: currentSelectStartTime,
            endTime: currentSelectEndTime,
            trainType: currentSelectTrainType,
            startDayForView: currentStartDayForView,
            startStationForView: currentStartStationForView,
            endStationForView: currentEndStationForView,
            selectKid: currentSelectKid,
            selectAdult: currentSelectAdult,
            selectPay: calculatedPay,
            docId: currentDocIds,
          }),
        ),
      );

      // 좌석 상태 초기화
      setSeatsState({});
      setSeatsStateCount(0);

      // 예매 완료 후 캐시 갱신 — 홈·내 승차권에 새 티켓 즉시 반영
      clearAllSeatsCache();
      await prefetchAllSeats();

      navigate('/');
    } catch (e) {
      console.log(e);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    handleSingleSelect,
    handleAllSelect,
    createSelectedSeats,
    seatsState,
    seatsInfo,
    seatsAllInfo,
    seatsStateCount,
    locks,
    isLocksLoaded,
  };
};

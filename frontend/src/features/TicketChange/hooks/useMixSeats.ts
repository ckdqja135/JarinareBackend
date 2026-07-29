// @role: features — 좌석 변경 혼합 선택·잠금 (빈 좌석 + 예매 좌석 혼합)
// @rule: api/ 호출만 담당, Firestore/RealtimeDB 직접 호출 금지
import { SeatType } from '@/entities/Seat/types/seatType';
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useRef, useState } from 'react';
import { seatsStateStore } from '../models/seatsStateStore';
import { useSeatsGroupInfo } from '@/features/TicketChange/hooks/useSeatsGroupInfo';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { seatIdsStore } from '../models/seatIdsStore';
import { prevSeatsTargetStore } from '../models/prevSeatsTargetStore';
import { seatsTargetStore } from '../models/seatsTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { shareKeepSeatsStore } from '../models/shareKeepSeatsStore';
import { seatsChangeMixTargetSeatIdStore } from '../models/seatsChangeMixTargetSeatIdStore';
import { useLocation } from 'react-router-dom';

export const useMixSeats = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupedArray } = useSeatsGroupInfo();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { seatsChangeTarget, setSeatsChangeTarget } = seatsChangeTargetStore();
  const { id } = seatIdsStore();
  const { prevSeatsTarget, setPrevSeatsTarget } = prevSeatsTargetStore();
  const { setSeatsTarget } = seatsTargetStore();
  const { trainNo } = trainDataStore();
  const { setShareKeepSeats } = shareKeepSeatsStore();
  const { setSeatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();

  const [keepSeats, setKeepSeats] = useState<SeatType[]>([]);
  const [seatsChangeMixTargetOrAllTarget, setSeatsChangeMixTargetOrAllTarget] =
    useState<string[]>([]);

  // seatId → userUid 형식 (상대방 잠금, 전체 잠금)
  const [locks, setLocks] = useState<Record<string, string>>({});
  const [locksByAll, setLocksByAll] = useState<Record<string, string>>({});

  const location = useLocation();
  const mySeats = Array.isArray(location.state)
    ? (location.state as SeatType[])
    : [];

  const user = auth.currentUser;
  const docId = mySeats[0]?.id;
  const prevTrainNoRef = useRef(trainNo);

  // 좌석 id가 true인 것만 추출
  const filtered = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  // 상대방 좌석 잠금 폴링
  useEffect(() => {
    if (!trainNo || !docId) return;
    let isMounted = true;

    const fetchLocks = async () => {
      if (!isMounted) return;
      try {
        const { data } = await backendClient.get<Record<string, string>>(
          '/api/seat-locks',
          { params: { docId, trainNoId: trainNo } },
        );
        if (isMounted) {
          setLocksByAll(data);
          const othersOnly = Object.fromEntries(
            Object.entries(data).filter(([, uid]) => uid !== user?.uid),
          );
          setLocks(othersOnly);
        }
      } catch {}
    };

    fetchLocks();
    return () => {
      isMounted = false;
    };
  }, [trainNo, docId]);

  // 호차 변경 시 이전 호차 잠금 해제
  useEffect(() => {
    const previousTrainNo = prevTrainNoRef.current;
    if (previousTrainNo !== undefined && previousTrainNo !== trainNo) {
      const myLockedSeats = Object.entries(seatsStateStore.getState().seatsState)
        .filter(([, v]) => v === true)
        .map(([seatId]) => seatId);

      myLockedSeats.forEach((seatId) => {
        backendClient
          .delete('/api/seat-locks', {
            params: { lockKey: `${docId}/${previousTrainNo}/${seatId}` },
          })
          .catch(() => {});
      });
    }
    prevTrainNoRef.current = trainNo;
  }, [trainNo]);

  // /ticket/seatchange 이동 시 잠금 해제
  useEffect(() => {
    if (location.pathname !== '/ticket/seatchange') return;
    const myLockedSeats = Object.entries(seatsState)
      .filter(([, v]) => v === true)
      .map(([seatId]) => seatId);
    myLockedSeats.forEach((seatId) => {
      backendClient
        .delete('/api/seat-locks', {
          params: { lockKey: `${docId}/${trainNo}/${seatId}` },
        })
        .catch(() => {});
    });
  }, [location.pathname]);

  // 좌석 잠금
  const lockSeat = async (seatId: string) => {
    if (!user) return;
    try {
      await backendClient.post('/api/seat-locks', {
        lockKey: `${docId}/${trainNo}/${seatId}`,
      });
    } catch {}
  };

  // 좌석 잠금 해제
  const unlockSeat = async (seatId: string) => {
    try {
      await backendClient.delete('/api/seat-locks', {
        params: { lockKey: `${docId}/${trainNo}/${seatId}` },
      });
    } catch {}
  };

  useEffect(() => {
    // 예매된 본인의 좌석 개수만큼 상대방의 좌석 채우기,
    // 부족하면 빈 좌석으로 채우기
    const mixedTargetSeatId = mySeats.map((_, i) => {
      return seatsChangeMixTargetOrAllTarget[i] ?? filtered[i];
    });
    setSeatsChangeMixTargetSeatId(mixedTargetSeatId);
  }, [seatsChangeMixTargetOrAllTarget, seatsState]);

  // 빈 좌석 클릭 시 이전에 선택한 좌석 상태 유지
  useEffect(() => {
    const filteredGroupSeats = groupedArray.filter(
      (item) => item.length <= mySeats.length,
    );
    const eachSeat = seatsChangeInfo.filter((item) => item.seatId === id);

    const selectedGroupSeatsByTime = filteredGroupSeats
      .flat()
      .filter((item) => {
        const isTarget = eachSeat[0]?.createAt;
        return item.createAt === isTarget;
      });

    setKeepSeats((prev) => {
      if (
        selectedGroupSeatsByTime.length === 0 ||
        prev.length === selectedGroupSeatsByTime.length
      ) {
        return prev;
      }
      return selectedGroupSeatsByTime;
    });
  }, [groupedArray, mySeats, seatsChangeInfo, id]);

  // 알림 기능에서 데이터 전송 시 사용할 이전 좌석 상태
  useEffect(() => {
    setShareKeepSeats(keepSeats);
  }, [keepSeats]);

  useEffect(() => {
    // 예매된 좌석들(본인 포함)
    const targetIds = seatsChangeTarget.map((item) => item.seatId);

    // 예매된 본인의 좌석 개수와 상대방의 좌석 개수가 동일한 경우
    if (mySeats.length === seatsChangeTarget.length) {
      // 상대방이 점유한 좌석은 선택 불가
      for (let i = 0; i < seatsChangeTarget.length; i++) {
        const isLockedByOther = !!locks[id];
        if (isLockedByOther) return;
      }

      // 좌석 선택 취소
      if (seatsChangeMixTargetOrAllTarget.includes(id)) {
        for (let i = 0; i < targetIds.length; i++) {
          unlockSeat(targetIds[i]);
        }
        targetIds.length = 0;
      }
      // 좌석 선택 및 잠금
      setSeatsChangeMixTargetOrAllTarget(targetIds);
      for (let i = 0; i < targetIds.length; i++) {
        lockSeat(targetIds[i]);
      }
      setPrevSeatsTarget(targetIds);
    }

    // 예매된 본인의 좌석 개수보다 상대방의 좌석 개수가 적은 경우
    if (mySeats.length > seatsChangeTarget.length) {
      // 상대방이 점유한 좌석은 선택 불가
      for (let i = 0; i < seatsChangeTarget.length; i++) {
        const isLockedByOther = !!locks[id];
        if (isLockedByOther) return;
      }

      setSeatsChangeMixTargetOrAllTarget((prev) => {
        const newSeats = prev.filter((item) => !prevSeatsTarget.includes(item));

        // 좌석 선택 취소
        if (newSeats.includes(id)) {
          if (targetIds.includes(id)) {
            for (let i = 0; i < newSeats.length; i++) {
              unlockSeat(newSeats[i]);
            }
            newSeats.length = 0;
            return newSeats;
          }
          return newSeats.filter((item) => item !== id);
        }

        const result = Array.from(
          new Set([...newSeats, ...filtered, ...targetIds]),
        );
        for (let i = 0; i < result.length; i++) {
          lockSeat(result[i]);
        }
        return Array.from(new Set([...newSeats, ...filtered, ...targetIds]));
      });
    }
  }, [seatsState, seatsChangeTarget]);

  // 선택한 좌석 즉시 반영
  useEffect(() => {
    setSeatsTarget(seatsChangeMixTargetOrAllTarget);
  }, [seatsChangeMixTargetOrAllTarget]);

  // 호차 변경 시 선택한 좌석 애니메이션 초기화
  const resetSeatsState = () => {
    setSeatsChangeMixTargetOrAllTarget([]);
    setPrevSeatsTarget([]);
    setSeatsChangeTarget([]);
    setSeatsState({});
  };

  useEffect(() => {
    resetSeatsState();
    return () => resetSeatsState();
  }, [trainNo]);

  // 백엔드 respond API가 좌석 교체를 처리하므로 직접 Firestore 호출 불필요
  const mixSeatsChange = async (
    _emptySeatsTarget: string[],
    _mySeats: SeatType[],
    _newKeepSeats: SeatType[],
    _mixSeatId: string[],
  ) => {};

  return {
    mixSeatsChange,
    seatsChangeMixTargetOrAllTarget,
    keepSeats,
    setKeepSeats,
    setShareKeepSeats,
    locksByAll,
  };
};

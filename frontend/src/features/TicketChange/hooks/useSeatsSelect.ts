// @role: features — 좌석 변경 페이지 좌석 선택·잠금
// @rule: api/ 호출만 담당, Firestore/RealtimeDB 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { seatsStateStore } from '../models/seatsStateStore';
import { useSeatsGroupInfo } from '@/features/TicketChange/hooks/useSeatsGroupInfo';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useMixSeats } from './useMixSeats';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';

export const useSeatsSelect = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { groupedArray } = useSeatsGroupInfo() || {};
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { setSeatsChangeTarget, setIsSeatsChangeTarget } =
    seatsChangeTargetStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeMixTargetOrAllTarget } = useMixSeats();

  // seatId → userUid 형식
  const [locks, setLocks] = useState<Record<string, string>>({});
  const [isLocksLoaded, setIsLocksLoaded] = useState(false);
  const isSelectingRef = useRef<Record<string, boolean>>({});

  const location = useLocation();
  const mySeats: SeatType[] = location.state;
  const user = auth.currentUser;
  const docId = mySeats[0]?.id;

  const selectedCount = Object.values(seatsState).filter(Boolean).length;

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
          const othersOnly = Object.fromEntries(
            Object.entries(data).filter(([, uid]) => uid !== user?.uid),
          );
          setLocks(othersOnly);
          setIsLocksLoaded(true);
        }
      } catch {
        if (isMounted) setIsLocksLoaded(true);
      }
    };

    fetchLocks();

    return () => {
      isMounted = false;
      // 페이지 벗어나면 선택 좌석 잠금 해제
      Object.keys(seatsState)
        .filter((id) => seatsState[id] === true)
        .forEach((seatId) => {
          backendClient
            .delete('/api/seat-locks', {
              params: { lockKey: `${docId}/${trainNo}/${seatId}` },
            })
            .catch(() => {});
        });
    };
  }, [trainNo, docId]);

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

  const handleSeatsSelect = async (id: string) => {
    if (!user) return;

    if (isSelectingRef.current[id]) return;
    isSelectingRef.current[id] = true;

    try {
      // 변경할려는 좌석의 수와 동일하거나 그보다 적은 타 좌석
      const filteredGroupSeats = groupedArray.filter(
        (item) => item.length <= mySeats.length,
      );

      // 선택한 각 좌석
      const eachSeat = seatsChangeInfo.filter((item) => item.seatId === id);

      // 선택한 좌석이 동일한 생성 시간인 좌석들
      const selectedGroupSeatsByTime = filteredGroupSeats
        .flat()
        .filter((item) => {
          const isTarget = eachSeat[0]?.createAt ?? 0;
          return item.createAt === isTarget;
        });

      // 내 좌석이지만 다른 승차권인 좌석
      const mySeatsNotInThisTicket = seatsChangeInfo
        .filter((item) => item.userId === user?.uid)
        .filter((item) => mySeats[0].createAt !== item.createAt);

      // 현재 사용자의 좌석들이지만 해당 승차권의 좌석이 아닌 좌석이 하나라도 있으면 선택 금지
      if (
        selectedGroupSeatsByTime.filter((item) =>
          mySeatsNotInThisTicket.includes(item),
        ).length > 0
      ) {
        return;
      }
      setSeatsChangeTarget(selectedGroupSeatsByTime);

      // 선택한 좌석과 내 좌석의 개수가 동일하면 true 그렇지 않으면 false
      if (selectedGroupSeatsByTime.length === mySeats.length) {
        setIsSeatsChangeTarget(true);
        return;
      }
      setIsSeatsChangeTarget(false);

      // 이미 예매된 좌석이거나 잠긴 좌석이면 선택 불가
      const isMineOrOthers = seatsChangeInfo.some(
        (item) => item.trainNoId === trainNo && item.seatId === id,
      );
      const isLockedByOther = !!locks[id];
      if (isMineOrOthers || isLockedByOther) return;

      const isSelected = seatsState[id] === true;

      if (
        selectedCount === mySeats.length ||
        mySeats.length === seatsChangeMixTargetOrAllTarget.length
      ) {
        if (isSelected) {
          setSeatsState({ ...seatsState, [id]: false });
          await unlockSeat(id);
          return;
        }
        return;
      }

      // 선택한 좌석을 다시 선택하면 빈 좌석으로 바뀐다.
      if (isSelected) {
        setSeatsState({ ...seatsState, [id]: false });
        await unlockSeat(id);
        return;
      }
      // 빈 좌석을 선택하면 선택한 좌석으로 바뀐다.
      setSeatsState({ ...seatsState, [id]: true });
      await lockSeat(id);
    } finally {
      isSelectingRef.current[id] = false;
    }
  };

  return { handleSeatsSelect, locks, isLocksLoaded };
};

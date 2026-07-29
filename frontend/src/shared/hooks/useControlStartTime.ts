import { auth } from '../firebase/firebase';
import { formatStartTime, isToday } from '../lib/formatDate';
import { useEffect, useState } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { useCreateStartTime } from '@/features/Notification/hooks/useCreateStartTime';

export const useControlStartTime = () => {
  const { groupedArray } = useTicketLists() ?? {};
  const { creatStartTime } = useCreateStartTime();

  const [timeDifferenceData, setTimeDifferenceData] = useState<SeatType[][]>([
    [],
  ]);

  // 이미 실행한 좌석 기록용 Set
  const [isExistData, setIsExistData] = useState<Set<string>>(new Set());

  const user = auth.currentUser;

  useEffect(() => {
    if (!groupedArray || !user) return;

    const timers: NodeJS.Timeout[] = [];
    const now = Date.now();
    const newTimeDiffData: SeatType[][] = [];

    groupedArray.forEach((item) => {
      // 현재 사용자가 아니거나 오늘 날짜가 아니면 return
      if (item[0].userId !== user.uid || item[0].startDay !== isToday()) return;

      // 고유 키 생성 (중복 방지용)
      const seatKey = `${item[0].startTime}-${item[0].trainType}`;

      // 이미 데이터가 존재하면 return
      if (isExistData.has(seatKey)) return;

      const seatTime = formatStartTime(String(item[0].startTime)).getTime();
      // 출발 5분 전
      const alertStart = seatTime - 5 * 60 * 1000;
      // 출발 1분 전
      const alertEnd = seatTime - 1 * 60 * 1000;

      // 데이터의 시간이 5분~1분 범위 안이라면
      if (now >= alertStart && now <= alertEnd) {
        newTimeDiffData.push(item);
        setIsExistData((prev) => new Set(prev).add(seatKey));

        // 아직 5분~1분 전이 안되었으면 delay 후 실행
      } else if (now < alertStart) {
        // 실행하기까지 남은 시간
        const delay = alertStart - now;
        // 시간 예약
        const timer = setTimeout(() => {
          setIsExistData((prev) => new Set(prev).add(seatKey));
        }, delay);
        timers.push(timer);
      }
    });

    // 시간 조건에 해당하는 데이터만 사용
    if (newTimeDiffData.length > 0) {
      setTimeDifferenceData(newTimeDiffData);
      (async () => {
        await creatStartTime(newTimeDiffData);
      })();
    }

    return () => timers.forEach(clearTimeout);
    // user 객체는 참조 값이 다르므로, user.uid로 불필요한 렌더링 최적화
  }, [groupedArray, user?.uid, isExistData]);

  return { timeDifferenceData };
};

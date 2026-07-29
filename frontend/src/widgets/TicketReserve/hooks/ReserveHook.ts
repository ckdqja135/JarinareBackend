import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Value } from '../types/ReserveType';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import {
  formatDate,
  formatDateForView,
  formatStartDate,
} from '@/shared/lib/formatDate';
import { useDebouncedRefetch } from '@/features/TicketReserve/hooks/useDebouncedRefetch';

export const useDaySelect = () => {
  const [value, onChange] = useState<Value>(new Date());
  const { setStartDay, setStartDayForView } = trainDataStore();
  useEffect(() => {
    setStartDay(formatDate(new Date(Number(value))));
    setStartDayForView(formatDateForView(new Date(Number(value))));
  }, [value]);
  return { value, onChange };
};

export const useNavigation = () => {
  const navigate = useNavigate();
  return { navigate };
};

export const useDayHandle = () => {
  const { setStartDay, setStartDayForView, startDay } = trainDataStore();
  const [day, setDay] = useState(formatStartDate(startDay));

  // 어제 날짜
  const handleYesterday = () => {
    const today = new Date();
    const prevDate = new Date(day);

    // 금일보다 이전 날짜는 보여주지 않는다.
    if (day > today) {
      prevDate.setDate(day.getDate() - 1);
      setDay(prevDate);
      setStartDay(formatDate(prevDate));
      setStartDayForView(formatDateForView(prevDate));
    }
  };
  // 내일 날짜
  const handleTomorrow = () => {
    // 쿼리에 들어가는 상태(날짜)를 바꾼 후 refetch로 기차 시간 목록 업데이트
    const prevDate = new Date(day);
    prevDate.setDate(day.getDate() + 1);
    setDay(prevDate);
    setStartDay(formatDate(prevDate));
    setStartDayForView(formatDateForView(prevDate));
  };

  return { day, handleYesterday, handleTomorrow };
};

export const useRefetchByStartTime = () => {
  const { startTime } = trainDataStore();
  const { refetch } = trainQueryData();

  // 1초 디바운싱으로 증가
  const debouncedRefetch = useDebouncedRefetch(refetch, 1000);

  useEffect(() => {
    // startTime이 실제로 변경되었을 때만 refetch
    if (startTime && startTime.trim() !== '') {
      debouncedRefetch();
    }
  }, [startTime, debouncedRefetch]);
};

export const useMaxDate = () => {
  const date = new Date();
  const maxDate = new Date(date.setDate(new Date().getDate() + 6));
  return { maxDate };
};

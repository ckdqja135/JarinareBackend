/**
 * @role: pages/TicketReserve — hooks
 * @rule: PCTrainCheckPage 상태·로직만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';
import {
  formatDate,
  formatDateForView,
  formatTime,
  formatTodayDate,
  isToday,
} from '@/shared/lib/formatDate';
import { SeatType } from '@/entities/Seat/types/seatType';
import {
  getCachedAllSeats,
  useAllSeatsInfo,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { TOTAL_SEATS } from '../constants/PCTrainCheckConstants';
import { DropdownType } from '../types/PCTrainCheckTypes';
import { formatTrainGradeName } from '@/shared/lib/formatTrainName';

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getCardStyle = (isSoldOut: boolean) => {
  if (isSoldOut) return 'border-gray-100 bg-gray-50';
  return 'border-gray-100 bg-white shadow-sm hover:shadow-md';
};

const calcDuration = (dep: number, arr: number): string => {
  const depH = Number(String(dep).substring(8, 10));
  const depM = Number(String(dep).substring(10, 12));
  const arrH = Number(String(arr).substring(8, 10));
  const arrM = Number(String(arr).substring(10, 12));
  let diff = arrH * 60 + arrM - (depH * 60 + depM);
  if (diff < 0) diff += 24 * 60;
  return diff >= 60
    ? `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ''}`
    : `${diff}분`;
};

export const usePCTrainCheckPage = () => {
  const { isFetching, trainTime } = trainQueryData();
  const {
    startDay,
    startTime,
    kid,
    adult,
    startStationForView,
    endStationForView,
    trainTypeForView,
    startTimeForView,
    setStartDay,
    setStartDayForView,
    setSelectStartTime,
    setSelectEndTime,
    setSelectTrainType,
    setSelectKid,
    setSelectAdult,
    setSelectPay,
    setTrainType,
    setTrainTypeForView,
    setStartTime,
    setStartTimeForView,
  } = trainDataStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  // 오늘 ~ +6일 (총 7일) 생성
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  // 홈에서 선택한 날짜(startDay: "20260624")로 초기화, 없으면 오늘
  const initialDate = startDay
    ? new Date(
        Number(startDay.substring(0, 4)),
        Number(startDay.substring(4, 6)) - 1,
        Number(startDay.substring(6, 8)),
      )
    : today;

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [allSeats, setAllSeats] = useState<SeatType[]>(getCachedAllSeats());
  useAllSeatsInfo((seats) => setAllSeats(seats));

  const weekDaysWithSelection = weekDays.map((date) => ({
    date,
    dow: date.getDay(),
    isSelected: isSameDay(date, selectedDate),
  }));

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setStartDay(formatDate(date));
    setStartDayForView(formatDateForView(date));
  };

  const handleToggleDropdown = (type: DropdownType) =>
    setOpenDropdown((prev) => (prev === type ? null : type));

  const handleCloseDropdown = () => setOpenDropdown(null);

  const handleSelectTrainType = async (id: string, label: string) => {
    await setTrainType(id);
    setTrainTypeForView(label);
    setOpenDropdown(null);
  };

  const handleSelectTime = (time: string, label: string) => {
    setStartTime(time);
    setStartTimeForView(label);
    setOpenDropdown(null);
  };

  const todayStr = isToday();

  const filtered = trainTime.filter((time) => {
    if (startDay === todayStr) {
      if (startTime > formatTime()) {
        return String(time.depplandtime).substring(8, 12) >= startTime;
      }
      return time.depplandtime >= formatTodayDate();
    }
    return String(time.depplandtime).substring(8, 12) >= startTime;
  });

  const trains = filtered.map((t) => {
    const trainTypeKey = t.traingradename + '-' + t.trainno;
    const reservedCount = allSeats.filter(
      (s) =>
        s.startDay === startDay &&
        s.startTime === t.depplandtime &&
        s.endTime === t.arrplandtime &&
        s.trainType === trainTypeKey,
    ).length;
    const isSoldOut = t.adultcharge === 0;
    return {
      ...t,
      durationText: calcDuration(t.depplandtime, t.arrplandtime),
      isSoldOut,
      remainingSeats: TOTAL_SEATS - reservedCount,
      cardStyle: getCardStyle(isSoldOut),
      trainGradeDisplay: formatTrainGradeName(t.traingradename),
    };
  });

  const handleSelectTrain = (
    depplandtime: number,
    arrplandtime: number,
    traingradename: string,
    trainno: number,
    adultcharge: number,
  ) => {
    openModal('ChoiceResultModal');
    setSelectStartTime(depplandtime);
    setSelectEndTime(arrplandtime);
    setSelectTrainType(traingradename + '-' + trainno);
    setSelectKid(kid);
    setSelectAdult(adult);
    setSelectPay(adultcharge);
  };

  return {
    isFetching,
    trains,
    startStationForView,
    endStationForView,
    trainTypeForView,
    startTimeForView,
    adult,
    kid,
    weekDaysWithSelection,
    selectedDate,
    openDropdown,
    handleSelectDate,
    handleToggleDropdown,
    handleCloseDropdown,
    handleSelectTrainType,
    handleSelectTime,
    handleSelectTrain,
    handleBack,
  };
};

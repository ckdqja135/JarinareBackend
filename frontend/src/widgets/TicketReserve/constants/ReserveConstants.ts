import start_station from '@/assets/icons/start_station.png';
import end_station from '@/assets/icons/end_station.png';
import calendar from '@/assets/icons/calendar.png';
import on_user from '@/assets/icons/on_user.png';
import check from '@/assets/icons/check.png';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useLocation } from 'react-router-dom';

export const reserveConstants = () => {
  const {
    startDay,
    selectStartTime,
    selectTrainType,
    startStationForView,
    endStationForView,
    startDayForView,
    kid,
    adult,
  } = trainDataStore();
  const { seatsAllInfo } = useSeatQueryData();

  const location = useLocation();

  const mySeats: SeatType[] = location.state || [];

  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}_${startStationForView}_${endStationForView}`;

  const recommendStationArray = [
    {
      text: '서울',
      id: 'NAT010000',
    },
    {
      text: '대전',
      id: 'NAT011668',
    },
    {
      text: '부산',
      id: 'NAT014445',
    },
    {
      text: '대구',
      id: 'NAT013239',
    },
    {
      text: '울산',
      id: 'NATH13717',
    },
    {
      text: '부전',
      id: 'NAT750046',
    },
    {
      text: '천안아산',
      id: 'NATH10960',
    },
    {
      text: '광명',
      id: 'NATH10219',
    },
    {
      text: '동대구',
      id: 'NAT013271',
    },
    {
      text: '오송',
      id: 'NAT050044',
    },
  ];
  const trainArray = [
    {
      id: '00',
      train: 'KTX',
      icon: check,
    },
    {
      id: '01',
      train: '새마을호',
      icon: check,
    },
    {
      id: '02',
      train: '무궁화호',
      icon: check,
    },
    {
      id: '03',
      train: '통근열차',
      icon: check,
    },
    {
      id: '04',
      train: '누리호',
      icon: check,
    },
    {
      id: '06',
      train: 'AREX직통',
      icon: check,
    },
    {
      id: '07',
      train: 'KTX-산천A',
      icon: check,
    },
    {
      id: '08',
      train: 'ITX-새마을호',
      icon: check,
    },
    {
      id: '09',
      train: 'ITX-청춘',
      icon: check,
    },
    {
      id: '10',
      train: 'KTX-산천B',
      icon: check,
    },
    {
      id: '16',
      train: 'KTX-이음',
      icon: check,
    },
    {
      id: '17',
      train: 'SRT',
      icon: check,
    },
    {
      id: '18',
      train: 'ITX-마음',
      icon: check,
    },
    {
      id: '19',
      train: 'KTX-청룡',
      icon: check,
    },
  ];
  const timeArray = [
    {
      timeView: '05:00',
      time: '0500',
    },
    {
      timeView: '06:00',
      time: '0600',
    },
    {
      timeView: '07:00',
      time: '0700',
    },
    {
      timeView: '08:00',
      time: '0800',
    },
    {
      timeView: '09:00',
      time: '0900',
    },
    {
      timeView: '10:00',
      time: '1000',
    },
    {
      timeView: '11:00',
      time: '1100',
    },
    {
      timeView: '12:00',
      time: '1200',
    },
    {
      timeView: '13:00',
      time: '1300',
    },
    {
      timeView: '14:00',
      time: '1400',
    },
    {
      timeView: '15:00',
      time: '1500',
    },
    {
      timeView: '16:00',
      time: '1600',
    },
    {
      timeView: '17:00',
      time: '1700',
    },
    {
      timeView: '18:00',
      time: '1800',
    },
    {
      timeView: '19:00',
      time: '1900',
    },
    {
      timeView: '20:00',
      time: '2000',
    },
    {
      timeView: '21:00',
      time: '2100',
    },
    {
      timeView: '22:00',
      time: '2200',
    },
    {
      timeView: '23:00',
      time: '2300',
    },
    {
      timeView: '24:00',
      time: '2400',
    },
  ];
  const trainNoArray = [
    {
      trainNoView: `${location.pathname === '/reserve/seatcheck' ? seatsAllInfo.filter(({ id, trainNoId }) => id === docIds && trainNoId === '1').length : seatsAllInfo.filter(({ id, trainNoId }) => id === mySeats[0]?.id && trainNoId === '1').length}`,
      trainNo: '1',
      icon: check,
    },
    {
      trainNoView: `${location.pathname === '/reserve/seatcheck' ? seatsAllInfo.filter(({ id, trainNoId }) => id === docIds && trainNoId === '2').length : seatsAllInfo.filter(({ id, trainNoId }) => id === mySeats[0]?.id && trainNoId === '2').length}`,
      trainNo: '2',
      icon: check,
    },
    {
      trainNoView: `${location.pathname === '/reserve/seatcheck' ? seatsAllInfo.filter(({ id, trainNoId }) => id === docIds && trainNoId === '3').length : seatsAllInfo.filter(({ id, trainNoId }) => id === mySeats[0]?.id && trainNoId === '3').length}`,
      trainNo: '3',
      icon: check,
    },
    {
      trainNoView: `${location.pathname === '/reserve/seatcheck' ? seatsAllInfo.filter(({ id, trainNoId }) => id === docIds && trainNoId === '4').length : seatsAllInfo.filter(({ id, trainNoId }) => id === mySeats[0]?.id && trainNoId === '4').length}`,
      trainNo: '4',
      icon: check,
    },
  ];
  const reserveWayArray = [
    {
      icon: start_station,
      text:
        startStationForView === ''
          ? '출발지를 선택하세요'
          : startStationForView,
      attribute: '출발',
      buttonText: '변경',
      modalType: 'StartPlaceModal',
    },
    {
      icon: end_station,
      text:
        endStationForView === '' ? '도착지를 선택하세요' : endStationForView,
      attribute: '도착',
      buttonText: '변경',
      modalType: 'EndPlaceModal',
    },
    {
      icon: calendar,
      text: startDayForView === '' ? '날짜를 선택하세요' : startDayForView,
      attribute: '가는날',
      buttonText: '변경',
      modalType: 'DayModal',
    },
    {
      icon: on_user,
      text: kid === 0 && adult === 0 ? '인원을 선택하세요' : adult + kid + '명',
      attribute: '인원',
      buttonText: '변경',
      modalType: 'CountModal',
    },
  ] as const;
  const seatsRows = [1, 2, 3, 4, 5, 6];

  return {
    recommendStationArray,
    trainArray,
    timeArray,
    trainNoArray,
    reserveWayArray,
    seatsRows,
  };
};

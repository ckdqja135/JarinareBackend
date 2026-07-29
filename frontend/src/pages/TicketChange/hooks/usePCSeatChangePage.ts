/**
 * @role: pages — PC 좌석변경 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useSeatsChangeBlocked } from '@/features/Notification/hooks/useSeatsChangeBlocked';
import { useRequestSenderTimer } from '@/features/Notification/hooks/useRequestTimer';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import { useMixSeats } from '@/features/TicketChange/hooks/useMixSeats';
import { useSeatsSelect } from '@/features/TicketChange/hooks/useSeatsSelect';
import { seatIdsStore } from '@/features/TicketChange/models/seatIdsStore';
import { useGetSeatsState } from '@/features/TicketChange/hooks/useGetSeatsState';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { reserveConstants } from '@/widgets/TicketReserve/constants/ReserveConstants';
import useModalStore from '@/widgets/model/TicketChangeStore';
import { auth } from '@/shared/firebase/firebase';

const TOTAL_SEATS = 24;

const getCongestion = (reserved: number) => {
  const ratio = reserved / TOTAL_SEATS;
  if (ratio < 0.3) return { label: '여유', bg: '#dcfce7', color: '#16a34a' };
  if (ratio < 0.7) return { label: '보통', bg: '#fef9c3', color: '#ca8a04' };
  return { label: '혼잡', bg: '#fee2e2', color: '#ef4444' };
};

export const usePCSeatChangePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mySeats: SeatType[] = location.state;

  const { seatsChangeTarget } = seatsChangeTargetStore();
  const { seatsTarget } = seatsTargetStore();
  const { isBlocked } = useSeatsChangeBlocked();
  const { remaining } = useRequestSenderTimer();
  const { seatsChangeMixTargetOrAllTarget } = useMixSeats();
  const { handleSeatsSelect, locks, isLocksLoaded } = useSeatsSelect();
  const { setId } = seatIdsStore();
  const { seatsChangeInfo } = useGetSeatsState();
  const { seatsState } = seatsStateStore();
  const { openModal } = useModalStore();
  const {
    trainNo,
    setTrainNo,
    selectTrainType,
    startStationForView,
    endStationForView,
  } = trainDataStore();
  const { seatsRows, trainNoArray } = reserveConstants();
  const user = auth.currentUser;

  const [isTrainDropdownOpen, setIsTrainDropdownOpen] = useState(false);

  const trainNoSeatsCount = seatsChangeInfo.filter(
    (item) => item.trainNoId === trainNo,
  ).length;

  const trainNoArrayWithCongestion = trainNoArray.map(
    ({ trainNo: no, trainNoView }) => ({
      trainNo: no,
      trainNoView,
      ...getCongestion(Number(trainNoView)),
    }),
  );

  // 현재 승차권 내 내 좌석과 변경 대상이 겹치는지 확인
  const mySeatsInThisTicket =
    mySeats?.filter((item) =>
      seatsChangeTarget.some(
        (i) => i.seatId === item.seatId && i.trainNoId === item.trainNoId,
      ),
    ).length > 0;

  const isAllSelected = seatsTarget.length === mySeats?.length;

  const handleToggleTrainDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrainDropdownOpen((prev) => !prev);
  };
  const handleCloseTrainDropdown = () => setIsTrainDropdownOpen(false);
  const handleSelectTrainNo = (no: string) => {
    setTrainNo(no);
    setIsTrainDropdownOpen(false);
  };

  const handleSeatClick = async (id: string) => {
    setId(id);
    await handleSeatsSelect(id);
  };

  const handleRequestChange = () => {
    if (isBlocked || mySeatsInThisTicket || !isAllSelected) return;
    openModal('SeatChangeModal');
  };

  return {
    navigate,
    mySeats,
    seatsChangeTarget,
    seatsTarget,
    isBlocked,
    remaining,
    seatsChangeMixTargetOrAllTarget,
    locks,
    isLocksLoaded,
    seatsChangeInfo,
    seatsState,
    trainNo,
    selectTrainType,
    startStationForView,
    endStationForView,
    seatsRows,
    trainNoArrayWithCongestion,
    trainNoSeatsCount,
    isTrainDropdownOpen,
    mySeatsInThisTicket,
    isAllSelected,
    handleToggleTrainDropdown,
    handleCloseTrainDropdown,
    handleSelectTrainNo,
    handleSeatClick,
    handleRequestChange,
    user,
  };
};

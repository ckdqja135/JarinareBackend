import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsStateStore } from '@/features/TicketReserve/model/seatsStateStore';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { backendClient } from '@/shared/api/backendClient';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import SeatCheckList from '@/widgets/TicketReserve/ui/SeatCheckList';
import SeatCheckMenu from '@/widgets/TicketReserve/ui/SeatCheckMenu';
import SeatCheckState from '@/widgets/TicketReserve/ui/SeatCheckState';
import PCSeatCheckPage from './PCSeatCheckPage';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SeatCheckPage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  const navigate = useNavigate();
  const { handleAllSelect, seatsStateCount, isLocksLoaded } =
    useSeatQueryData();
  const {
    selectKid,
    selectAdult,
    startDay,
    selectStartTime,
    selectTrainType,
    startStationForView,
    endStationForView,
    trainNo,
  } = trainDataStore();
  const { setSeatsState, seatsState } = seatsStateStore();

  // ref로 최신값 유지 → 클린업 클로저에서 정확한 상태 참조
  const seatsStateRef = useRef(seatsState);
  const docIdsRef = useRef('');
  const trainNoRef = useRef(trainNo);

  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}_${startStationForView}_${endStationForView}`;

  useEffect(() => { seatsStateRef.current = seatsState; }, [seatsState]);
  useEffect(() => { docIdsRef.current = docIds; }, [docIds]);
  useEffect(() => { trainNoRef.current = trainNo; }, [trainNo]);

  // 페이지 떠날 때 좌석 선택 초기화 + 잠금 해제
  useEffect(() => {
    return () => {
      if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return;

      const state = seatsStateRef.current;
      const lockedSeatIds = Object.keys(state).filter((id) => state[id]);
      lockedSeatIds.forEach((seatId) => {
        const lockKey = `${docIdsRef.current}/${trainNoRef.current}/${seatId}`;
        backendClient.delete('/api/seat-locks', { params: { lockKey } }).catch(() => {});
      });

      setSeatsState({});
    };
  }, []);

  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY);

  const isAllSelected =
    seatsStateCount === 0 ? false : seatsStateCount === selectKid + selectAdult;

  const isAllLocked =
    seatsStateCount === 0 ? false : seatsStateCount <= selectKid + selectAdult;

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCSeatCheckPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton title="좌석 선택" />
        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white px-4 py-4 shadow-sm">
          <SeatCheckMenu />
          <SeatCheckList />
          <SeatCheckState />
        </div>
        <div className="mt-4 flex w-full gap-3">
          <button
            onClick={isLocksLoaded && isAllLocked ? undefined : handleAllSelect}
            className={`flex-1 rounded-2xl py-3.5 text-base font-bold text-white transition-colors ${
              isLocksLoaded && isAllLocked
                ? 'bg-gray-300'
                : 'bg-blue active:brightness-95'
            }`}
          >
            자동 선택
          </button>
          <button
            onClick={
              isAllSelected
                ? isLoggedIn
                  ? () => openModal('PayModal')
                  : () => navigate('/auth/login')
                : undefined
            }
            className={`flex-[2] rounded-2xl py-3.5 text-base font-bold text-white transition-colors ${
              isAllSelected ? 'bg-blue active:brightness-95' : 'bg-gray-300'
            }`}
          >
            {isAllSelected
              ? isLoggedIn
                ? '예매'
                : '로그인하기'
              : `${seatsStateCount} / ${selectKid + selectAdult} 선택`}
          </button>
        </div>
      </div>

      {/* 공통 모달 */}
      {isShow == false || modalType == undefined ? null : <Modal />}
    </>
  );
};

export default SeatCheckPage;

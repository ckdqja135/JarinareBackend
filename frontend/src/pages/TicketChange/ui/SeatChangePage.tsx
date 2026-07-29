/**
 * @role: pages — 좌석변경 페이지 (PC/모바일 분기)
 * @rule: PC/모바일 분기만 담당, 비즈니스 로직 포함 금지
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { useSeatsChangeBlocked } from '@/features/Notification/hooks/useSeatsChangeBlocked';
import { useRequestSenderTimer } from '@/features/Notification/hooks/useRequestTimer';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/TicketChangeStore';
import Modal from '@/widgets/TicketChange/ui/Modal';
import SeatChangeList from '@/widgets/TicketChange/ui/SeatChangeList';
import SeatChangeMenu from '@/widgets/TicketChange/ui/SeatChangeMenu';
import SeatChangeState from '@/widgets/TicketChange/ui/SeatChangeState';
import PCSeatChangePage from './PCSeatChangePage';
import { useLocation } from 'react-router-dom';

const SeatChangePage = () => {
  const { isShow, modalType, openModal } = useModalStore();

  const { seatsChangeTarget } = seatsChangeTargetStore();
  const { seatsTarget } = seatsTargetStore();
  const { isBlocked } = useSeatsChangeBlocked();
  const { remaining } = useRequestSenderTimer();
  const location = useLocation();
  const mySeats: SeatType[] = location.state;

  // 현재 승차권 안에 있는 내 좌석들(내 좌석들 중 다른 승차권에 포함된 좌석은 제외)
  const mySeatsInThisTicket =
    mySeats.filter((item) =>
      seatsChangeTarget.some(
        (i) => i.seatId === item.seatId && i.trainNoId === item.trainNoId,
      ),
    ).length > 0;

  const isAllSelected = seatsTarget.length === mySeats.length ? true : false;

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCSeatChangePage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton title="좌석 변경" />
        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white px-4 py-4 shadow-sm">
          <SeatChangeMenu />
          <SeatChangeList />
          <SeatChangeState />
        </div>
        <div className="mt-4 flex w-full items-center gap-3">
          <span className="flex-1 text-xs font-semibold text-gray-400">
            빈 좌석 또는 타 승객 좌석을 선택해주세요
          </span>
          <button
            onClick={async () => {
              if (isBlocked) return;
              if (mySeatsInThisTicket) return;
              if (mySeats.length === seatsTarget.length) {
                openModal('SeatChangeModal');
              }
            }}
            className={`flex-1 rounded-2xl py-3.5 text-base font-bold text-white transition-colors ${
              isAllSelected && !mySeatsInThisTicket && !isBlocked
                ? 'bg-blue active:brightness-95'
                : 'bg-gray-300'
            }`}
          >
            {isBlocked
              ? `요청 기다리는 중.. ${remaining !== null ? `(${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')})` : ''}`
              : `${seatsTarget.length} / ${mySeats.length} 선택`}
          </button>
        </div>
        {isShow == false || modalType == undefined ? null : <Modal />}
      </div>
    </>
  );
};

export default SeatChangePage;

import Ticket from '@/shared/ui/Ticket';
import arrow from '@/assets/icons/arrow.png';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useTicketLocation } from '../hooks/useTicketLocation';
import useModalStore from '@/widgets/model/TicketReturnStore';
import Modal from '@/widgets/TicketReturn/ui/Modal';
import TicketButton from '@/shared/ui/TicketButton';
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';

const SeatReturnPage = () => {
  const { location } = useTicketLocation();
  const { openModal, modalType, isShow } = useModalStore();
  const { setSeatsReturnData } = seatsReturnDataStore();
  const seats: SeatType[] = location.state.groups;

  const filtred = seats.map((id) => id.seatId);

  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <BackWardPageButton />
      <div className="mt-[30px] w-full pl-[10px] pr-[10px]">
        <div className="flex justify-center text-lg font-bold">
          <span>{seats[0].startStationForView}</span>
          <img src={arrow} width={25} height={20} className="mx-[30px]" />
          <span>{seats[0].endStationForView}</span>
        </div>
        <div className="mt-[55px]">
          <Ticket
            seatIds={filtred}
            startTime={seats[0].startTime}
            endTime={seats[0].endTime}
            trainType={seats[0].trainType}
            trainNoId={seats[0].trainNoId}
            startDayForView={seats[0].startDayForView}
            selectKid={seats[0].selectKid}
            selectAdult={seats[0].selectAdult}
            selectPay={seats[0].selectPay}
          />
        </div>
        <div className="mt-[60px]">
          <TicketButton
            onClick={() => {
              setSeatsReturnData(seats);
              openModal('ReturnModal');
            }}
            text="반환"
            bgColor="lightImpossible"
            textColor="red"
          />
        </div>
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default SeatReturnPage;

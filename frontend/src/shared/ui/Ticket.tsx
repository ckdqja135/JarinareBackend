import { formatAM_PM, formatTimeView } from '../lib/formatDate';
import TicketList from './TicketList';
import { TicketProps } from '../types/TicketType';
import { memo } from 'react';

const Ticket = memo(
  ({
    startTime,
    endTime,
    trainType,
    startDayForView,
    trainNoId,
    seatIds,
    selectKid,
    selectAdult,
    selectPay,
  }: TicketProps) => {
    return (
      <div className="flex w-full flex-col gap-y-4">
        <TicketList
          title="시간"
          text={
            (formatAM_PM(String(startTime)) < 12 ? '오전 ' : '오후 ') +
            formatTimeView(String(startTime)) +
            ' - ' +
            (formatAM_PM(String(endTime)) < 12 ? '오전' : '오후 ') +
            formatTimeView(String(endTime))
          }
          textColor="blue"
        />
        <TicketList title="출발" text={startDayForView} textColor="blue" />
        <TicketList title="기차" text={trainType} textColor="black" />
        <TicketList
          title="호차"
          text={`${trainNoId}호차 ${seatIds.map((seatId) => seatId)}`}
          textColor="black"
        />
        <TicketList
          title="인원"
          text={`어른 ${selectAdult}명 • 어린이 ${selectKid}명`}
          textColor="black"
        />
        <div className="w-full border border-lightGray" />
        <TicketList
          title="요금"
          text={`${selectPay.toLocaleString('ko-KR')}원`}
          textColor="black"
        />
      </div>
    );
  },
);

Ticket.displayName = 'Ticket';

export default Ticket;

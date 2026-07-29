import miniarrow from '@/assets/icons/miniarrow.png';
import { MiniTicketProps } from '../types/MiniTicketType';

const MiniTicket = ({
  startDay,
  startStation,
  startTime,
  endStation,
  endTime,
  trainName,
}: MiniTicketProps) => {
  return (
    <div className="flex h-[100px] w-[320px]">
      <div className="flex h-[100px] w-[230px] flex-col items-center justify-around rounded-lg bg-lightestGray">
        <div className="flex h-5 w-[200px] items-center justify-center rounded-xs bg-white">
          <span className="text-xs font-bold text-blue">{startDay}</span>
        </div>
        <div className="flex h-[45px] w-[200px] flex-col justify-center rounded-xs bg-white">
          <div className="flex items-center justify-around px-[10px] text-base font-bold text-black">
            <span className="">{startStation}</span>
            <img src={miniarrow} className="h-[10px] w-[15px]" />
            <span>{endStation}</span>
          </div>
          <div className="flex justify-between px-[10px] text-xs text-black">
            <span>{startTime}</span>
            <span>{endTime}</span>
          </div>
        </div>
      </div>
      <span className="flex h-[100px] w-[90px] items-center justify-center rounded-lg bg-lightBlue text-tiny font-bold text-blue">
        {trainName}
      </span>
    </div>
  );
};

export default MiniTicket;

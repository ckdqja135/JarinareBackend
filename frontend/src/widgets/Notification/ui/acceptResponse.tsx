import { IsAcceptRepsonseProps } from '../types/isAcceptResponseType';
import { elapsedTime } from '@/shared/lib/formatDate';

export const AcceptResponse = ({
  responseTime,
  responseContant,
  isRead,
  onClick,
  responseTitle,
}: IsAcceptRepsonseProps) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-sm px-4 py-3 ${isRead ? 'bg-gray-100' : 'bg-white'}`}
      style={{
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.05), 0 -1px 3px rgba(0,0,0,0.05), 1px 0 3px rgba(0,0,0,0.05), -1px 0 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded-full bg-green/10 px-2 py-0.5 text-xs font-bold text-green">
          좌석 변경
        </span>
        <span className="text-xs text-darkGray">
          {elapsedTime(Number(responseTime))}
        </span>
      </div>
      <p className="text-tiny font-bold text-gray-800">
        {responseContant?.map((item) => item.seatId).join(' • ')} 자리에서
        변경이 <span className="text-green">{responseTitle}&nbsp;</span>
        되었습니다.
      </p>
    </div>
  );
};

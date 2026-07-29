import { StartTimeNotificationType } from '../types/startTimeNotificationType';
import { elapsedTime } from '@/shared/lib/formatDate';

const StartTimeNotification = ({
  createdAt,
  seats,
  isRead,
  onClick,
}: StartTimeNotificationType) => {
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
        <span className="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-bold text-blue">
          출발 알림
        </span>
        <span className="text-xs text-darkGray">
          {elapsedTime(Number(createdAt))}
        </span>
      </div>
      <p className="text-tiny font-bold text-gray-800">
        {seats[0].trainType} 열차가 곧 출발합니다.
      </p>
    </div>
  );
};

export default StartTimeNotification;

import useModalStore from '@/widgets/model/Notification';
import { NotificationRequestProps } from '../types/NotificationType';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { responesBySeatIdTrainNoIdStore } from '@/features/Notification/models/responseBySeatIdAndTrainNoIdStore';
import { elapsedTime } from '@/shared/lib/formatDate';
import { useRequestReceiverTimer } from '@/features/Notification/hooks/useRequestTimer';

const NotificationRequest = ({
  requestTitle,
  requstTime,
  requsetContant,
  isRead,
  onClick,
  requestPath,
}: NotificationRequestProps) => {
  const { remaining } = useRequestReceiverTimer(
    Number(requstTime),
    requestPath,
  );
  const { openModal } = useModalStore();
  const { setSeatIds } = responesBySeatIdStore();
  const { setSeatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();

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
          {requestTitle}
        </span>
        <span className="text-xs text-darkGray">
          {elapsedTime(Number(requstTime))}
        </span>
      </div>
      <p className="text-tiny font-bold text-gray-800">
        {requsetContant.map((item) => item.seatId).join(' • ')} 자리에서 변경
        요청이 들어왔습니다.
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span
          onClick={(e) => {
            e.stopPropagation();
            openModal('ResponseModal');
            setSeatIds(requsetContant.map((item) => item.seatId));
            setSeatIdsAndTrainNoId(requsetContant);
          }}
          className="cursor-pointer text-xs font-bold text-blue underline"
        >
          요청보기
        </span>
        {remaining !== null && (
          <span
            className={`text-xs font-bold ${remaining <= 10 ? 'text-red' : 'text-darkGray'}`}
          >
            {String(Math.floor(remaining / 60)).padStart(2, '0')}:
            {String(remaining % 60).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
};

export default NotificationRequest;

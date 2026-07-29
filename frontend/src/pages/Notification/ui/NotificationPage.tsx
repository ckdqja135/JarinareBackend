import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import backward from '@/assets/icons/backward.png';
import { useBackButton } from '@/widgets/layouts/hooks/BackWardHook';
import useModalStore from '@/widgets/model/Notification';
import { AcceptResponse } from '@/widgets/Notification/ui/acceptResponse';
import Modal from '@/widgets/Notification/ui/Modal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';
import { RefuseResponse } from '@/widgets/Notification/ui/refuseResponse';
import setting from '@/assets/icons/setting.png';
import { Link } from 'react-router-dom';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useIsReadNotification } from '@/features/Notification/hooks/useIsReadNotification';
import SwipeToDelete from '@/widgets/Notification/ui/SwipeToDelete';
import { backendClient } from '@/shared/api/backendClient';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { onClick: goBack } = useBackButton();
  const { response } = useChangeResponse();
  const { refuseResponse, acceptResponse } = useIsAcceptResponse();
  const {
    departureNotifs,
    updateChangeResponse,
    updateAcceptResponse,
    updateRefuseResponse,
    updateStartTimeResponse,
    updateAllResponse,
  } = useIsReadNotification();

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100">
      <div className="flex w-full items-center justify-between px-[28px] pt-[20px]">
        <div className="flex items-center gap-3">
          <img
            onClick={goBack}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <span className="text-base font-bold">알림</span>
        </div>
        <Link to={'/setting'}>
          <img width={27} height={27} src={setting} />
        </Link>
      </div>
      <span
        onClick={async () => await updateAllResponse()}
        className="mt-[20px] flex w-full cursor-pointer justify-end pr-[10px] text-tiny text-darkGray underline"
      >
        모두 읽음
      </span>
      <div className="mt-[5px] w-full">
        {departureNotifs.map((notif) => (
          <SwipeToDelete
            key={notif.id}
            onDelete={() =>
              backendClient.patch(`/api/notifications/${notif.id}/read`).catch(() => {})
            }
          >
            <StartTimeNotification
              createdAt={notif.createdAt}
              seats={(notif.payload.seats as SeatType[]) ?? []}
              isRead={notif.isRead}
              onClick={async () => await updateStartTimeResponse(notif.id)}
            />
          </SwipeToDelete>
        ))}
        {response.map((req) => (
          <SwipeToDelete
            key={req.id}
            onDelete={() =>
              backendClient.post(`/api/seat-change-requests/${req.id}/read`).catch(() => {})
            }
          >
            <NotificationRequest
              requestTitle="좌석 변경"
              requstTime={req.createdAt}
              requsetContant={(req.mySeat as unknown as SeatType[]) ?? []}
              isRead={req.isRead}
              onClick={async () => await updateChangeResponse(req.id)}
              requestPath={req.id}
            />
          </SwipeToDelete>
        ))}
        {acceptResponse?.map((req) => (
          <SwipeToDelete
            key={req.id}
            onDelete={() =>
              backendClient.post(`/api/seat-change-requests/${req.id}/read`).catch(() => {})
            }
          >
            <AcceptResponse
              responseTitle="좌석 변경 수락"
              responseTime={req.createdAt}
              responseContant={(req.targetSeat as unknown as SeatType[]) ?? []}
              responseDeleteContant={(req.mySeat as unknown as SeatType[]) ?? []}
              isRead={req.isRead}
              onClick={async () => await updateAcceptResponse(req.id)}
            />
          </SwipeToDelete>
        ))}
        {refuseResponse?.map((req) => (
          <SwipeToDelete
            key={req.id}
            onDelete={() =>
              backendClient.post(`/api/seat-change-requests/${req.id}/read`).catch(() => {})
            }
          >
            <RefuseResponse
              responseTitle="좌석 변경 거절"
              responseTime={req.createdAt}
              responseContant={(req.targetSeat as unknown as SeatType[]) ?? []}
              responseDeleteContant={(req.mySeat as unknown as SeatType[]) ?? []}
              isRead={req.isRead}
              onClick={async () => await updateRefuseResponse(req.id)}
            />
          </SwipeToDelete>
        ))}
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;

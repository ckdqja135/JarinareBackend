/**
 * @role: widgets — PC 알림 오른쪽 사이드바
 * @rule: 렌더링만 담당, 사이드바 열림/닫힘은 notificationSidebarStore로 제어
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import { useIsReadFollowNotification } from '@/features/Follow/hooks/useIsReadFollowNotification';
import useNotifiModalStore from '@/widgets/model/Notification';
import { AcceptResponse } from '@/widgets/Notification/ui/acceptResponse';
import AcceptModal from '@/widgets/Notification/ui/AcceptModal';
import ResponseModal from '@/widgets/Notification/ui/ResponseModal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';
import { RefuseResponse } from '@/widgets/Notification/ui/refuseResponse';
import FollowNotification from '@/widgets/Notification/ui/FollowNotification';
import BoardPostNotification from '@/widgets/Notification/ui/BoardPostNotification';
import { useNavigate } from 'react-router-dom';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useIsReadNotification } from '@/features/Notification/hooks/useIsReadNotification';
import SwipeToDelete from '@/widgets/Notification/ui/SwipeToDelete';
import useNotificationSidebarStore from '../model/notificationSidebarStore';
import { backendClient } from '@/shared/api/backendClient';

const PCNotificationSidebar = () => {
  const { isOpen, close } = useNotificationSidebarStore();
  const navigate = useNavigate();
  const { isShow, modalType } = useNotifiModalStore();
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
  const {
    followNotifications,
    topFollowerNotifications,
    followPostNotifications,
    updateFollowResponse,
    updateTopFollowerResponse,
    updateFollowPostResponse,
    updateAllFollowResponse,
  } = useIsReadFollowNotification();

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={close} />
      )}

      {/* 사이드바 패널 */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col bg-gray-100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <span className="text-base font-bold">알림</span>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* 모두 읽음 */}
        <div className="flex justify-end px-4 pt-3">
          <span
            onClick={async () => {
              await updateAllResponse();
              await updateAllFollowResponse();
              close();
            }}
            className="cursor-pointer text-tiny text-darkGray underline"
          >
            모두 읽음
          </span>
        </div>

        {/* 알림 목록 */}
        <div className="mt-2 flex-1 overflow-y-auto px-1 pb-6 pt-3">
          {topFollowerNotifications.map((notif) => (
            <SwipeToDelete
              key={notif.id}
              onDelete={() =>
                backendClient.patch(`/api/notifications/${notif.id}/read`).catch(() => {})
              }
            >
              <BoardPostNotification
                type="topFollower"
                posterName={(notif.payload.posterName as string) ?? ''}
                postDocId={(notif.payload.postDocId as string | null) ?? null}
                createdAt={notif.createdAt}
                isRead={notif.isRead}
                onClick={async () => await updateTopFollowerResponse(notif.id)}
                onNavigate={() => {
                  const posterUid = notif.payload.posterUid as string;
                  const postDocId = notif.payload.postDocId as string;
                  navigate('/board/board/detail', {
                    state: {
                      post: { id: `boards/${posterUid}/board/${postDocId}` },
                    },
                  });
                }}
              />
            </SwipeToDelete>
          ))}
          {followPostNotifications.map((notif) => (
            <SwipeToDelete
              key={notif.id}
              onDelete={() =>
                backendClient.patch(`/api/notifications/${notif.id}/read`).catch(() => {})
              }
            >
              <BoardPostNotification
                type="followPost"
                posterName={(notif.payload.posterName as string) ?? ''}
                createdAt={notif.createdAt}
                isRead={notif.isRead}
                onClick={async () => await updateFollowPostResponse(notif.id)}
              />
            </SwipeToDelete>
          ))}
          {followNotifications.map((notif) => (
            <SwipeToDelete
              key={notif.id}
              onDelete={() =>
                backendClient.patch(`/api/notifications/${notif.id}/read`).catch(() => {})
              }
            >
              <FollowNotification
                followerName={(notif.payload.followerName as string) ?? ''}
                createdAt={notif.createdAt}
                isRead={notif.isRead}
                onClick={async () => await updateFollowResponse(notif.id)}
              />
            </SwipeToDelete>
          ))}
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
      </aside>

      {isShow && modalType ? (
        <div className="fixed inset-0 z-[60]">
          {modalType === 'ResponseModal' && <ResponseModal centered />}
          {modalType === 'AcceptModal' && <AcceptModal centered />}
        </div>
      ) : null}
    </>
  );
};

export default PCNotificationSidebar;

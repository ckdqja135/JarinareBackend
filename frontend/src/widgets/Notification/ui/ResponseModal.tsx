/**
 * @role: widgets — ui
 * @rule: 렌더링만 담당, 사이드이펙트는 useAutoCloseModal에 위임
 */
import { useDeleteNotification } from '@/features/Notification/hooks/useDeleteNotification';
import useModalStore from '../../model/Notification';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useHandleChange } from '@/features/TicketChange/hooks/useHandleChange';
import { useIsAcceptRequest } from '@/features/Notification/hooks/useIsAcceptRequest';
import RequestChangeButton from '@/widgets/TicketChange/ui/RequsetChangeButton';
import { useAutoCloseModal } from '@/widgets/Notification/hooks/useAutoCloseModal';

const ResponseModal = ({ centered = false }: { centered?: boolean }) => {
  const { openModal, closeModal } = useModalStore();
  const { seatIds } = responesBySeatIdStore();
  const { response } = useChangeResponse();
  const { handleClick } = useHandleChange();
  const { deleteRequsetAndResponse } = useDeleteNotification();
  const { accpetRequest, refuseRequest } = useIsAcceptRequest();

  const currentRequest = response[0];
  useAutoCloseModal(response, 'ResponseModal');

  // PC 다이얼로그 스타일
  if (centered) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={() => closeModal('ResponseModal')}
      >
        <div
          className="w-[440px] animate-fade-up rounded-2xl bg-white px-8 pb-8 pt-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">좌석 변경 요청</p>
              <p className="mt-0.5 text-xs text-gray-400">
                수락 또는 거절을 선택해주세요
              </p>
            </div>
            <button
              onClick={() => closeModal('ResponseModal')}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
            <div className="mb-1 text-xs font-bold text-gray-400">
              변경 요청 좌석
            </div>
            <div className="flex flex-wrap gap-2">
              {seatIds.map((id) => (
                <span
                  key={id}
                  className="rounded-lg bg-blue/10 px-3 py-1.5 text-sm font-bold text-blue"
                >
                  {id}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-darkGray">
              위 좌석으로 변경 요청이 들어왔습니다. 자리를 변경하겠습니까?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                closeModal('ResponseModal');
                await refuseRequest(currentRequest?.id ?? '');
                await deleteRequsetAndResponse(currentRequest?.id ?? '');
              }}
              className="flex-1 rounded-xl bg-gray-100 py-3.5 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200"
            >
              거절
            </button>
            <button
              onClick={async () => {
                closeModal('ResponseModal');
                openModal('AcceptModal');
                await handleClick(currentRequest?.id ?? '');
                await accpetRequest(currentRequest?.id ?? '');
                await deleteRequsetAndResponse(currentRequest?.id ?? '');
                setTimeout(() => {
                  closeModal('AcceptModal');
                }, 1500);
              }}
              className="flex-[2] rounded-xl bg-blue py-3.5 text-base font-bold text-white transition-colors hover:bg-blue/90 active:brightness-95"
            >
              수락
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 모바일 바텀시트 스타일
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('ResponseModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-1 text-base font-bold text-gray-800">좌석 변경 요청</p>
        <p className="text-tiny text-darkGray">
          <span className="font-bold text-blue">{seatIds.join(' • ')}</span>{' '}
          자리에서 변경 요청이 들어왔습니다. 자리를 변경하겠습니까?
        </p>

        <div className="mt-6 flex gap-3">
          <RequestChangeButton
            text="거절"
            bgColor="lightBlue"
            textColor="blue"
            onClick={async () => {
              closeModal('ResponseModal');
              await refuseRequest(currentRequest?.id ?? '');
              await deleteRequsetAndResponse(currentRequest?.id ?? '');
            }}
            className="flex-1 rounded-2xl py-3.5"
          />
          <RequestChangeButton
            text="수락"
            bgColor="blue"
            textColor="white"
            onClick={async () => {
              closeModal('ResponseModal');
              openModal('AcceptModal');
              await handleClick(currentRequest?.id ?? '');
              await accpetRequest(currentRequest?.id ?? '');
              await deleteRequsetAndResponse(currentRequest?.id ?? '');
              setTimeout(() => {
                closeModal('AcceptModal');
              }, 1500);
            }}
            className="flex-[2] rounded-2xl py-3.5"
          />
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;

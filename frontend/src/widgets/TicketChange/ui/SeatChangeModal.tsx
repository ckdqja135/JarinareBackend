/**
 * @role: widgets — 좌석 변경 요청 확인 모달
 * @rule: isSent UI 상태만 관리, 도메인 로직은 features 훅에 위임
 */
import { useState } from 'react';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import useModalStore from '../../model/TicketChangeStore';
import { useChangeRequest } from '@/features/Notification/hooks/useChangeRequest';
import { useNavigation } from '@/widgets/TicketList/hooks/useNavigation';

const SeatChangeModal = () => {
  const { closeModal } = useModalStore();
  const { changeRequset } = useChangeRequest();
  const { navigate } = useNavigation();
  const [isSent, setIsSent] = useState(false);

  // 좌석 상태를 UI로만 보여주는 용도이므로 상태 구독을 하지 않는다.(리렌더링 최적화)
  const target = seatsTargetStore.getState().seatsTarget;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40 lg:justify-center lg:backdrop-blur-sm"
      onClick={() => closeModal('SeatChangeModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5 lg:mb-0 lg:w-[440px] lg:animate-fade-up lg:rounded-2xl lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일 핸들 바 */}
        <div className="mb-5 flex justify-center lg:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {!isSent ? (
          <>
            {/* PC 헤더 */}
            <div className="mb-5 hidden lg:flex lg:items-start lg:justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  좌석 변경 요청
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  변경할 좌석을 확인해주세요
                </p>
              </div>
              <button
                onClick={() => closeModal('SeatChangeModal')}
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

            {/* 모바일 제목 */}
            <p className="mb-1 text-base font-bold text-gray-800 lg:hidden">
              좌석 변경 요청
            </p>

            {/* 선택 좌석 요약 */}
            <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
              <div className="mb-1 text-xs font-bold text-gray-400">
                변경 요청 좌석
              </div>
              <div className="flex flex-wrap gap-2">
                {target.map((seat) => (
                  <span
                    key={seat}
                    className="rounded-lg bg-blue/10 px-3 py-1.5 text-sm font-bold text-blue"
                  >
                    {seat}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-darkGray">
                위 좌석으로 변경 요청을 보내겠습니까?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => closeModal('SeatChangeModal')}
                className="flex-1 rounded-xl bg-gray-100 py-3.5 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  setIsSent(true);
                  await changeRequset(target);
                  setTimeout(() => {
                    closeModal('SeatChangeModal');
                    navigate('/');
                  }, 1500);
                }}
                className="flex-[2] rounded-xl bg-blue py-3.5 text-base font-bold text-white transition-colors hover:bg-blue/90 active:brightness-95"
              >
                요청
              </button>
            </div>
          </>
        ) : (
          /* 요청 완료 — 카드 내 전환 */
          <div className="flex flex-col items-center py-6">
            <div className="animate-bounce-in">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#E7F2FD" />
                <path
                  d="M18 32L46 18L38 46L30 36L18 32Z"
                  fill="#0062FF"
                  opacity="0.15"
                />
                <path
                  d="M18 32L46 18L38 46L30 36L18 32Z"
                  stroke="#0062FF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <line
                  x1="30"
                  y1="36"
                  x2="46"
                  y2="18"
                  stroke="#0062FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="mt-4 animate-fade-up text-base font-bold text-gray-800">
              자리 요청을 보냈습니다!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatChangeModal;

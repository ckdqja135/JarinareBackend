import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';

const RequestChangeModal = () => {
  const { seatsState } = seatsStateStore();
  const target = seatsTargetStore().seatsTarget;
  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  const isChanged = target.length === emptySeatsTarget.length;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex w-[220px] flex-col items-center rounded-3xl bg-white px-6 py-8 shadow-xl">
        {/* 아이콘 */}
        <div className="animate-bounce-in">
          {isChanged ? (
            /* 변경 완료 - 체크 원형 */
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill="#E7F2FD" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#0062FF"
                strokeWidth="3"
                strokeDasharray="176"
                strokeDashoffset="0"
                style={{ animation: 'draw-circle 0.5s ease-out forwards' }}
              />
              <polyline
                points="20,33 28,41 44,24"
                stroke="#0062FF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="36"
                strokeDashoffset="0"
                style={{ animation: 'draw-check 0.4s ease-out 0.3s both' }}
              />
            </svg>
          ) : (
            /* 요청 전송 - 페이퍼플레인 원형 */
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
          )}
        </div>

        <span className="animate-fade-up mt-4 text-base font-bold text-gray-800">
          {isChanged ? '자리가 변경되었습니다!' : '자리 요청을 보냈습니다!'}
        </span>

        <style>{`
          @keyframes draw-circle {
            from { stroke-dashoffset: 176; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes draw-check {
            from { stroke-dashoffset: 36; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default RequestChangeModal;

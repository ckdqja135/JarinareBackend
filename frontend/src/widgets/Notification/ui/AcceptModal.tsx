/**
 * @role: widgets — ui
 * @rule: 렌더링만 담당, centered prop으로 PC/모바일 스타일 분기
 */
const AcceptModal = ({ centered = false }: { centered?: boolean }) => {
  const cardClass = centered
    ? 'w-[440px] animate-fade-up rounded-2xl bg-white px-8 pb-8 pt-5 shadow-2xl'
    : 'flex w-[220px] flex-col items-center rounded-3xl bg-white px-6 py-8 shadow-xl';

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${centered ? 'bg-black/40 backdrop-blur-sm' : 'bg-darkGray/50'}`}
    >
      <div className={cardClass}>
        {centered && (
          <p className="mb-6 text-lg font-bold text-gray-900">좌석 변경 완료</p>
        )}

        <div
          className={`flex flex-col items-center ${centered ? 'gap-4' : ''}`}
        >
          {/* 체크 아이콘 애니메이션 */}
          <div className="animate-bounce-in">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill="#E7F2FD" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#0062FF"
                strokeWidth="3"
                strokeDasharray="176"
                strokeDashoffset="176"
                style={{ animation: 'draw-circle 0.5s ease-out forwards' }}
              />
              <polyline
                points="20,33 28,41 44,24"
                stroke="#0062FF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="36"
                strokeDashoffset="36"
                style={{ animation: 'draw-check 0.4s ease-out 0.3s forwards' }}
              />
            </svg>
          </div>

          <span
            className={`animate-fade-up font-bold text-gray-800 ${centered ? 'text-base' : 'mt-4 text-base'}`}
          >
            자리가 변경되었습니다!
          </span>
        </div>

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

export default AcceptModal;

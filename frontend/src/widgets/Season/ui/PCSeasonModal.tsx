/**
 * @role: widgets — PC 계절 할인 모달 UI
 * @rule: 렌더링만 담당, createPortal로 전체 화면 오버레이
 */
import { createPortal } from 'react-dom';
import type { PCSeasonModalProps } from '../types/SeasonModalType';
import { usePCSeasonModal } from '../hooks/usePCSeasonModal';

const PCSeasonModal = ({ onClose }: PCSeasonModalProps) => {
  const { season, stations, style, bgImage } = usePCSeasonModal();

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] hidden items-center justify-center bg-black/60 px-[35%] py-10 lg:left-[220px] lg:top-14 lg:flex lg:backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-fit w-full animate-fade-up flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: style.gradient }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1/4: 계절 이미지 */}
        <div
          className="relative shrink-0 overflow-hidden rounded-t-2xl"
          style={{
            height: '190px',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 아래로 갈수록 계절 색이 진해지는 오버레이 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, ${style.overlayColor} 100%)`,
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-8 text-center">
            <p className="rounded-full bg-white/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              SPECIAL DISCOUNT
            </p>
            <p className="mt-1 text-xl font-black text-white">
              {season} 여행 특별 할인
            </p>
            <p className="mt-0.5 text-xs text-white/80">
              선택 시 결제 금액 10% 즉시 할인
            </p>
          </div>
        </div>

        {/* 3/4: 내용 */}
        <div className="relative z-10 -mt-4 flex flex-col gap-3 rounded-t-2xl bg-white px-4 pb-3 pt-4">
          {/* 추천 여행지 헤더 */}
          <div className="mt-2 flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-sm font-bold text-gray-400">추천 여행지</span>
          </div>

          {/* 지역 카드 목록 */}
          <div className="mb-2 grid grid-cols-2 gap-3">
            {stations.map((station, idx) => {
              const isLeftCol = idx % 2 === 0;
              const isOddRow = Math.floor(idx / 2) % 2 === 0;

              // 왼쪽홀수: 메인색 bg + 흰 아이콘 / 왼쪽짝수: 연회색 bg + 회색 아이콘
              // 오른쪽홀수: 연한 메인색 bg + 메인색 아이콘 / 오른쪽짝수: 중간 메인색 bg + 메인색 아이콘
              const iconBgStyle = isLeftCol
                ? isOddRow
                  ? { backgroundColor: style.primaryHex }
                  : { backgroundColor: '#e5e7eb' }
                : isOddRow
                  ? { backgroundColor: style.lightHex }
                  : { backgroundColor: style.midHex };

              const iconStroke = isLeftCol
                ? isOddRow
                  ? '#ffffff'
                  : '#6b7280'
                : style.primaryHex;

              return (
                <div
                  key={station}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white py-3 pl-2 pr-0"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={iconBgStyle}
                  >
                    {isOddRow ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={iconStroke}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 17l4-8 4 4 3-5 4 9" />
                        <path d="M3 20h18" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={iconStroke}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="10" width="18" height="11" rx="1" />
                        <path d="M7 10V6a5 5 0 0 1 10 0v4" />
                        <line x1="12" y1="14" x2="12" y2="17" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-bold text-gray-800">
                      {station}
                    </span>
                    <span className="text-[10px] font-bold text-blue">
                      10% 할인
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 안내 카드 */}
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <svg
              className="mt-0.5 shrink-0"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0062FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
            </svg>
            <p className="text-[10px] leading-relaxed text-gray-400">
              할인 적용은 프로모션 기간 내 결제 완료 건에 한하며, 조기 종료될 수
              있습니다.
            </p>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PCSeasonModal;

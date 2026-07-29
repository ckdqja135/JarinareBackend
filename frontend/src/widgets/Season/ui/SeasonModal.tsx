/**
 * @role: widgets — 계절 할인 역 목록 모달 UI
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useSeasonModal } from '../hooks/useSeasonModal';
import { SeasonModalProps } from '../types/SeasonModalType';

const SeasonModal = ({ onClose }: SeasonModalProps) => {
  const { season, stations, style } = useSeasonModal();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 lg:hidden"
      onClick={onClose}
    >
      <div
        className="mx-6 w-full rounded-3xl bg-white px-6 pb-6 pt-5 shadow-xl lg:mx-0 lg:w-[400px] lg:animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">{style.emoji}</span>
          <div>
            <p className={`text-base font-bold ${style.color}`}>
              {season} 여행 특별 할인
            </p>
            <p className="text-xs text-gray-400">선택 시 결제금액 10% 할인</p>
          </div>
        </div>

        {/* 역 목록 */}
        <div className="mb-5 flex flex-wrap gap-2">
          {stations.map((station) => (
            <span
              key={station}
              className={`rounded-full ${style.bg} px-3 py-1 text-xs font-bold ${style.color}`}
            >
              {station}
            </span>
          ))}
        </div>

        <p className="mb-4 text-[11px] text-gray-400">
          * 결제 모달에서 이벤트 적용 시 해당 역 목적지에 한해 10% 할인이
          적용됩니다.
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-gray-100 py-3 text-sm font-bold text-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default SeasonModal;

/**
 * @role: widgets — 계절 할인 배너 UI
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';
import SeasonModal from './SeasonModal';
import PCSeasonModal from './PCSeasonModal';

const SeasonBanner = () => {
  const { season, stations, style } = useCurrentSeason();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative mt-4 w-full overflow-hidden rounded-lg text-left shadow-md active:brightness-90"
        style={{ background: style.gradient }}
      >
        {/* 별 장식 */}
        <svg
          className="absolute left-[28%] top-0 opacity-15"
          width="140"
          height="140"
          viewBox="0 0 24 24"
          fill="white"
          style={{ transform: 'rotate(20deg)' }}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        <svg
          className="absolute bottom-0 left-[62%] opacity-10"
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="white"
          style={{ transform: 'rotate(-15deg)' }}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>

        {/* 콘텐츠 */}
        <div className="relative flex items-center gap-4 px-5 py-3">
          {/* 계절 아이콘 */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner">
            {style.emoji}
          </div>

          {/* 텍스트 영역 */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-lg font-black text-white">
              {season} 특별 기차여행 할인 이벤트
            </p>
            <p className="mt-0.5 text-xs text-white/80">
              {season} 추천 역 {stations.length}곳 선택 시{' '}
              <span className="font-bold text-yellow-300 underline">
                10% 즉시 할인
              </span>{' '}
              혜택을 드립니다.
            </p>
          </div>

          {/* 자세히 보기 버튼 */}
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-2 shadow-md">
            <span className="text-sm font-bold text-blue">자세히 보기 ›</span>
          </div>
        </div>
      </button>

      {open && <SeasonModal onClose={() => setOpen(false)} />}
      {open && <PCSeasonModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default SeasonBanner;

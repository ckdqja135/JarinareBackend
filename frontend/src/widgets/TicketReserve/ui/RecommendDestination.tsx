/**
 * @role: widgets — 추천 여행지 UI 컴포넌트
 * @rule: 데이터 가공 금지, 전달받은 hook 결과만 렌더링
 */
import ReserveTitle from './ReserveTitle';
import { useRecommendDestination } from '../hooks/useRecommendDestination';
import { AGES } from '../constants/RecommendConstants';

const RecommendDestination = () => {
  const {
    selected,
    setSelected,
    detailCity,
    detailStat,
    filtered,
    handleCardClick,
    categories,
  } = useRecommendDestination();

  return (
    <div className="flex h-full flex-col">
      {/* 제목 + 카테고리 — 고정 영역 */}
      <div className="shrink-0">
        <ReserveTitle text="추천 여행지" showMore={false} />
        <div className="mb-3 flex w-full gap-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selected === cat
                  ? 'bg-blue text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* 여행지 그리드 */}
        <div className="mb-3 grid w-full grid-cols-3 gap-3 p-1">
          {filtered.map(({ city, desc, gradient, emoji }) => (
            <div
              key={city}
              className="relative flex flex-col justify-between rounded-2xl p-3 shadow-sm active:brightness-90"
              style={{
                background: gradient,
                height: '120px',
                cursor: 'pointer',
                transform: detailCity === city ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => handleCardClick(city)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{emoji}</span>
                {detailCity === city && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <span className="text-[10px] font-black text-blue">✓</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-y-0.5">
                <span className="text-sm font-bold text-white">{city}</span>
                <span className="text-[10px] font-medium leading-tight text-white/80">
                  {desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 상세 통계 카드 */}
        {detailCity && (
          <div className="mb-4 w-full rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-bold text-gray-800">
              {detailCity} 방문 통계
            </p>

            {detailStat ? (
              <div className="flex flex-col gap-y-4">
                {/* 성별 분포 */}
                <div className="flex flex-col gap-y-2">
                  <span className="text-xs font-bold text-gray-500">
                    성별 분포
                  </span>
                  {(() => {
                    // 남녀 인원 기준 비율 계산
                    const male = detailStat.byGender['남자'] ?? 0;
                    const female = detailStat.byGender['여자'] ?? 0;
                    const total = male + female;
                    if (total === 0)
                      return (
                        <p className="text-xs text-gray-400">
                          데이터가 없습니다.
                        </p>
                      );
                    const malePct = Math.round((male / total) * 100);
                    const femalePct = 100 - malePct;
                    return (
                      <>
                        <div className="flex h-5 w-full overflow-hidden rounded-full">
                          <div
                            className="flex items-center justify-center bg-blue text-[10px] font-bold text-white"
                            style={{ width: `${malePct}%` }}
                          >
                            {malePct > 15 ? `남 ${malePct}%` : ''}
                          </div>
                          <div
                            className="flex items-center justify-center bg-pink-400 text-[10px] font-bold text-white"
                            style={{ width: `${femalePct}%` }}
                          >
                            {femalePct > 15 ? `여 ${femalePct}%` : ''}
                          </div>
                        </div>
                        <div className="flex gap-x-3">
                          <div className="flex items-center gap-x-1">
                            <div className="h-2 w-2 rounded-full bg-blue" />
                            <span className="text-xs text-gray-500">
                              남자 {male.toLocaleString('ko-KR')}명
                            </span>
                          </div>
                          <div className="flex items-center gap-x-1">
                            <div className="h-2 w-2 rounded-full bg-pink-400" />
                            <span className="text-xs text-gray-500">
                              여자 {female.toLocaleString('ko-KR')}명
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 나이대별 분포 */}
                <div className="flex flex-col gap-y-2">
                  <span className="text-xs font-bold text-gray-500">
                    나이대별 분포
                  </span>
                  <div className="flex flex-col gap-y-1.5">
                    {(() => {
                      // 최대값 기준 상대 진행률 계산
                      const max = Math.max(
                        ...AGES.map((a) => detailStat.byAge[a] ?? 0),
                        1,
                      );
                      return AGES.map((age) => {
                        const cnt = detailStat.byAge[age] ?? 0;
                        const pct = Math.round((cnt / max) * 100);
                        return (
                          <div key={age} className="flex items-center gap-x-2">
                            <span className="w-9 text-right text-[10px] text-gray-400">
                              {age}
                            </span>
                            <div
                              className="flex-1 overflow-hidden rounded-full bg-gray-100"
                              style={{ height: '8px' }}
                            >
                              <div
                                className="h-full rounded-full bg-blue"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-[10px] text-gray-400">
                              {cnt}명
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400">
                데이터가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendDestination;

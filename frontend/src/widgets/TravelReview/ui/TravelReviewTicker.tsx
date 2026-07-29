/**
 * @role: widgets — 여행지 후기 Ticker UI
 * @rule: 렌더링만 담당, 데이터 가공 금지
 */
import { useNavigate } from 'react-router-dom';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useTravelReviewTicker } from '../hooks/useTravelReviewTicker';
import StarRating from '@/shared/ui/StarRating';
import imgGapyeong from '@/assets/background/가평.png';
import imgGangneung from '@/assets/background/강릉.png';
import imgGangchon from '@/assets/background/강촌.png';
import imgGyeongsan from '@/assets/background/경산.png';
import imgGyeongju from '@/assets/background/경주.png';
import imgGyeryong from '@/assets/background/계룡.png';
import imgGoraebul from '@/assets/background/고래불.png';
import imgGokseong from '@/assets/background/곡성.png';
import imgGongju from '@/assets/background/공주.png';
import imgGwangmyeong from '@/assets/background/광명.png';
import imgGwangjuSongjung from '@/assets/background/광주송정.png';
import imgGurye from '@/assets/background/구례구.png';
import imgGumi from '@/assets/background/구미.png';
import imgGupo from '@/assets/background/구포.png';
import imgGunsan from '@/assets/background/군산.png';
import imgGeundeok from '@/assets/background/근덕.png';
import imgGiseong from '@/assets/background/기성.png';
import imgGimcheon from '@/assets/background/김천.png';
import imgGimcheonGumi from '@/assets/background/김천구미.png';
import imgNaju from '@/assets/background/나주.png';
import imgNamwon from '@/assets/background/남원.png';
import imgNamchuncheon from '@/assets/background/남춘천.png';
import imgNonsan from '@/assets/background/논산.png';
import imgDanyang from '@/assets/background/단양.png';
import imgDaejeon from '@/assets/background/대전.png';
import imgDaecheon from '@/assets/background/대천.png';
import imgDongdaegu from '@/assets/background/동대구.png';
import imgDongtan from '@/assets/background/동탄.png';
import imgDonghae from '@/assets/background/동해.png';
import imgDunnae from '@/assets/background/둔내.png';
import imgMaseok from '@/assets/background/마석.png';
import imgManjong from '@/assets/background/만종.png';
import imgMaehwa from '@/assets/background/매화.png';
import imgBusan from '@/assets/background/부산.png';
import imgSareung from '@/assets/background/사릉.png';
import imgYeosu from '@/assets/background/여수.png';
import imgJeonju from '@/assets/background/전주.png';
import imgChuncheon from '@/assets/background/춘천.png';

const cityImageMap: Record<string, string> = {
  가평: imgGapyeong,
  강릉: imgGangneung,
  강촌: imgGangchon,
  경산: imgGyeongsan,
  경주: imgGyeongju,
  계룡: imgGyeryong,
  고래불: imgGoraebul,
  곡성: imgGokseong,
  공주: imgGongju,
  광명: imgGwangmyeong,
  광주송정: imgGwangjuSongjung,
  구례구: imgGurye,
  구미: imgGumi,
  구포: imgGupo,
  군산: imgGunsan,
  근덕: imgGeundeok,
  기성: imgGiseong,
  김천: imgGimcheon,
  김천구미: imgGimcheonGumi,
  나주: imgNaju,
  남원: imgNamwon,
  남춘천: imgNamchuncheon,
  논산: imgNonsan,
  단양: imgDanyang,
  대전: imgDaejeon,
  대천: imgDaecheon,
  동대구: imgDongdaegu,
  동탄: imgDongtan,
  동해: imgDonghae,
  둔내: imgDunnae,
  마석: imgMaseok,
  만종: imgManjong,
  매화: imgMaehwa,
  부산: imgBusan,
  사릉: imgSareung,
  여수: imgYeosu,
  전주: imgJeonju,
  춘천: imgChuncheon,
};

// 슬라이더 div = 200%, 카드 10장 × 10% = 100%, translateX(-50%) = 컨테이너 1폭 이동 후 루프
const CARD_HEIGHT = 200;

const TravelReviewTicker = ({ title = '여행지 후기' }: { title?: string }) => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const { tickerItems, loopItems } = useTravelReviewTicker(summaries);

  if (!isLoaded) {
    return (
      <div className="py-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border-x-[6px] border-gray-50 bg-white"
              style={{ width: '20%', height: CARD_HEIGHT }}
            >
              <div
                className="animate-pulse bg-gray-200"
                style={{ height: '66.67%' }}
              />
              <div
                className="flex flex-col justify-center gap-2 px-3"
                style={{ height: '33.33%' }}
              >
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tickerItems.length === 0) {
    return (
      <div className="py-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">{title}</p>
          <button
            onClick={() => navigate('/travel/review/list')}
            className="text-xs text-blue underline"
          >
            더보기
          </button>
        </div>
        <div
          onClick={() => navigate('/travel/review/list')}
          className="flex cursor-pointer items-center justify-center bg-white shadow-sm"
          style={{ height: CARD_HEIGHT }}
        >
          <p className="text-sm text-gray-400">
            첫 번째 여행지 후기를 작성해보세요 ✍️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between pr-2">
        <div className="flex items-center gap-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-lg font-bold text-gray-800">{title}</p>
        </div>
        <button
          onClick={() => navigate('/travel/review/list')}
          className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
        >
          더보기
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            width: '200%',
            animation: 'ticker-loop 30s linear infinite',
            willChange: 'transform',
          }}
        >
          {loopItems.map(({ city, averageRating, reviewCount }, idx) =>
            reviewCount === -1 ? (
              <div
                key={`${city}-${idx}`}
                className="shrink-0 px-[6px]"
                style={{ width: '10%', height: CARD_HEIGHT }}
              >
                <div
                  onClick={() => navigate('/travel/review/list')}
                  className="h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm active:brightness-90"
                >
                  {/* 상단 2/3 — 이미지 플레이스홀더 */}
                  <div
                    className="flex flex-col items-center justify-center gap-1 bg-gray-100"
                    style={{ height: '66.67%' }}
                  >
                    <span className="text-2xl">✍️</span>
                    <span className="text-[10px] text-gray-400">
                      후기를 작성해보세요
                    </span>
                  </div>
                  {/* 하단 1/3 */}
                  <div
                    className="flex flex-col justify-center px-3"
                    style={{ height: '33.33%' }}
                  />
                </div>
              </div>
            ) : (
              <div
                key={`${city}-${idx}`}
                className="shrink-0 px-[6px]"
                style={{ width: '10%', height: CARD_HEIGHT }}
              >
                <div
                  onClick={() =>
                    navigate('/travel/review', { state: { city } })
                  }
                  className="h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm active:brightness-90"
                >
                  {/* 상단 2/3 — 이미지 영역 */}
                  <div
                    className="relative flex items-center justify-center overflow-hidden bg-gray-100"
                    style={{ height: '66.67%' }}
                  >
                    {cityImageMap[city] ? (
                      <img
                        src={cityImageMap[city]}
                        alt={city}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    )}
                  </div>

                  {/* 하단 1/3 — 정보 영역 */}
                  <div
                    className="flex flex-col justify-center gap-1 px-3"
                    style={{ height: '33.33%' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-base font-bold text-gray-800">
                        {city}
                      </span>
                      <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-yellow-50 px-1.5 py-0.5 text-xs font-bold">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="#eab308"
                          stroke="#eab308"
                          strokeWidth="1"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-gray-800">
                          {averageRating.toFixed(1)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <StarRating rating={averageRating} />
                      <span className="text-xs text-gray-400">
                        후기 {reviewCount}개
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <style>{`
        @keyframes ticker-loop {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TravelReviewTicker;

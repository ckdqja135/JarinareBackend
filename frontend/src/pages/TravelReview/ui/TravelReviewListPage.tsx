/**
 * @role: pages — 여행지별 후기 게시판 목록 + 후기 작성 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backward from '@/assets/icons/backward.png';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useCreateTravelReview } from '@/features/TravelReview/hooks/useCreateTravelReview';
import { useSearchByStation } from '@/features/TravelReview/hooks/useSearchByStation';
import { usePagination } from '@/features/TravelReview/hooks/usePagination';
import type { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';
import { getAllStations } from '@/shared/lib/trainRoutes';
import StarRating from '@/shared/ui/StarRating';
import StarPicker from '@/shared/ui/StarPicker';

const GAP = 12; // gap-3 = 12px

const TravelReviewListPage = () => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const allStations = getAllStations();

  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(3);

  useEffect(() => {
    const measure = () => {
      const areaH = scrollAreaRef.current?.clientHeight ?? 0;
      const cardH = firstCardRef.current?.clientHeight ?? 0;
      if (areaH > 0 && cardH > 0) {
        setPageSize(Math.max(1, Math.floor(areaH / (cardH + GAP))));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isLoaded]);

  const { createReview } = useCreateTravelReview(selectedCity);

  // 역 이름 검색 결과
  const { results: searchResults } = useSearchByStation(searchQuery, summaries);

  // 페이지네이션
  const {
    paged: pagedRaw,
    page,
    totalPages,
    goNext,
    goPrev,
  } = usePagination(searchResults, pageSize);
  const paged = pagedRaw as DestinationReviewSummary[];

  // 역 선택 검색 필터 (작성 폼용)
  const filteredStations = useMemo(
    () =>
      citySearch.trim()
        ? allStations.filter((s) => s.includes(citySearch.trim()))
        : allStations,
    [allStations, citySearch],
  );

  const handleSubmit = async () => {
    if (!selectedCity || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    await createReview(title.trim(), content.trim(), rating);
    setSelectedCity('');
    setCitySearch('');
    setTitle('');
    setContent('');
    setRating(5);
    setShowForm(false);
    setSubmitting(false);
    navigate(0);
  };

  const showPagination = !showForm && isLoaded && totalPages > 1;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100">
      {/* 헤더 */}
      <div className="flex w-full shrink-0 items-center justify-between bg-gray-100 px-[28px] py-4">
        <div className="flex items-center gap-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">여행지 후기</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-blue px-3 py-1.5 text-xs font-bold text-white"
        >
          {showForm ? '취소' : '후기 작성'}
        </button>
      </div>

      {/* 검색 바 */}
      {!showForm && (
        <div className="shrink-0 px-4 pb-3">
          <input
            className="w-full rounded-2xl bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400"
            placeholder="역 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* 스크롤 영역 */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
        {/* 작성 폼 */}
        {showForm && (
          <div className="mx-4 mb-3 rounded-2xl bg-white p-4 shadow-sm">
            {/* 역 검색 */}
            <p className="mb-2 text-xs font-bold text-gray-500">역 선택</p>
            {selectedCity ? (
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">
                  {selectedCity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('');
                    setCitySearch('');
                  }}
                  className="text-xs text-gray-400 underline"
                >
                  변경
                </button>
              </div>
            ) : (
              <>
                <input
                  className="mb-2 w-full rounded-xl bg-gray-100 px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                  placeholder="역 이름 검색"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
                <div className="mb-3 flex max-h-[120px] flex-wrap gap-2 overflow-y-auto">
                  {filteredStations.length === 0 ? (
                    <span className="text-xs text-gray-400">
                      검색 결과가 없습니다.
                    </span>
                  ) : (
                    filteredStations.map((station) => (
                      <button
                        key={station}
                        type="button"
                        onClick={() => {
                          setSelectedCity(station);
                          setCitySearch('');
                        }}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 transition-all active:bg-blue active:text-white"
                      >
                        {station}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            <p className="mb-1 text-xs font-bold text-gray-500">별점</p>
            <StarPicker value={rating} onChange={setRating} />
            <input
              className="mt-3 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
              placeholder="내용을 입력하세요"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedCity}
              className="mt-3 w-full rounded-xl bg-blue py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        )}

        {/* 여행지 목록 */}
        {!showForm && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {/* 로딩 스켈레톤 */}
            {!isLoaded &&
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[72px] animate-pulse rounded-2xl bg-gray-200"
                />
              ))}

            {/* 검색 결과 없음 */}
            {isLoaded && searchQuery.trim() && searchResults.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-white shadow-sm">
                <span className="text-2xl">🔍</span>
                <p className="text-sm text-gray-400">검색 결과가 없습니다.</p>
              </div>
            )}

            {/* 데이터 없음 */}
            {isLoaded && !searchQuery.trim() && searchResults.length === 0 && (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-white shadow-sm">
                <span className="text-4xl">✍️</span>
                <p className="text-sm font-bold text-gray-600">
                  아직 작성된 후기가 없어요
                </p>
                <p className="text-xs text-gray-400">
                  첫 번째 여행지 후기를 남겨보세요!
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-1 rounded-xl bg-blue px-4 py-2 text-xs font-bold text-white"
                >
                  후기 작성하기
                </button>
              </div>
            )}

            {/* 목록 */}
            {isLoaded &&
              paged.map(({ city, averageRating, reviewCount }, i) => (
                <div
                  key={city}
                  ref={i === 0 ? firstCardRef : undefined}
                  onClick={() =>
                    navigate('/travel/review', { state: { city } })
                  }
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm active:brightness-95"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-800">
                      {city}
                    </span>
                    <StarRating rating={averageRating} showValue />
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    후기 {reviewCount}개
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 — NavBar 바로 위 */}
      {showPagination && (
        <div
          className="flex shrink-0 items-center justify-center gap-4 border-t border-gray-200 bg-gray-100 py-3"
          style={{ paddingBottom: 'calc(0.75rem + 80px)' }}
        >
          <button
            onClick={goPrev}
            disabled={page === 1}
            className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-gray-500 shadow-sm disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={page === totalPages}
            className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-gray-500 shadow-sm disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelReviewListPage;

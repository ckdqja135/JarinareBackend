/**
 * @role: pages — PC 여행지 후기 목록 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import StarRating from '@/shared/ui/StarRating';
import StarPicker from '@/shared/ui/StarPicker';
import { usePCTravelReviewListPage } from '../hooks/usePCTravelReviewListPage';
import { getProfileColor } from '../constants/travelReviewPageConstants';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const PCTravelReviewListPage = () => {
  const navigate = useNavigate();
  const {
    isLoaded,
    searchQuery,
    setSearchQuery,
    paged,
    page,
    totalPages,
    pageNumbers,
    goNext,
    goPrev,
    goToPage,
    totalCount,
    showWriteForm,
    setShowWriteForm,
    selectedCity,
    setSelectedCity,
    citySearch,
    setCitySearch,
    writeTitle,
    setWriteTitle,
    writeContent,
    setWriteContent,
    writeRating,
    setWriteRating,
    submitting,
    handleWriteSubmit,
    filteredStations,
    isLoggedIn,
  } = usePCTravelReviewListPage();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-64 pb-16 pt-10">
            <div className="flex flex-col gap-6">
              {/* 제목 칸 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  >
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
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    게시판
                  </button>
                  <h1 className="text-2xl font-black text-gray-900">
                    여행지 후기
                  </h1>
                  <p className="text-sm text-gray-400">
                    역별 여행 후기를 확인하고 직접 남겨보세요
                  </p>
                </div>
                {showWriteForm ? (
                  <button
                    onClick={() => setShowWriteForm(false)}
                    className="flex items-center gap-2 rounded-sm bg-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-blue/90"
                  >
                    취소
                  </button>
                ) : (
                  <button
                    onClick={() => setShowWriteForm(true)}
                    className="flex items-center gap-2 rounded-sm bg-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-blue/90"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                    후기 작성
                  </button>
                )}
              </div>

              {/* 후기 작성 카드 */}
              {showWriteForm && !isLoggedIn && (
                <div className="flex items-center justify-center rounded-sm bg-white p-10 shadow-sm">
                  <LoginRequiredBlock
                    description="로그인 후 후기를 작성할 수 있어요"
                    onLogin={() => navigate('/auth/login')}
                    size="md"
                  />
                </div>
              )}
              {showWriteForm && isLoggedIn && (
                <div className="flex flex-col gap-4 rounded-sm bg-white p-6 shadow-sm">
                  {/* 역 선택 */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-gray-400">역 선택</p>
                    {selectedCity ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-[3px] bg-lightBlue px-3 py-1 text-xs font-bold text-blue">
                          {selectedCity}
                        </span>
                        <button
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
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            className="w-full rounded-sm border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none placeholder:text-gray-300 focus:border-blue"
                            placeholder="역 이름 검색"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                          />
                        </div>
                        <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pt-1">
                          {filteredStations.map((station) => (
                            <button
                              key={station}
                              type="button"
                              onClick={() => {
                                setSelectedCity(station);
                                setCitySearch('');
                              }}
                              className="rounded-[3px] bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 hover:bg-lightBlue hover:text-blue"
                            >
                              {station}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* 별점 */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-gray-400">별점</p>
                    <StarPicker value={writeRating} onChange={setWriteRating} />
                  </div>
                  <input
                    type="text"
                    value={writeTitle}
                    onChange={(e) => setWriteTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    className="rounded-sm border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-blue"
                  />
                  <textarea
                    value={writeContent}
                    onChange={(e) => setWriteContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                    rows={4}
                    className="rounded-sm border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-blue"
                  />
                  <button
                    onClick={handleWriteSubmit}
                    disabled={
                      !selectedCity ||
                      !writeTitle.trim() ||
                      !writeContent.trim() ||
                      submitting
                    }
                    className="rounded-sm bg-blue py-2.5 text-sm font-bold text-white disabled:opacity-30"
                  >
                    {submitting ? '등록 중...' : '등록'}
                  </button>
                </div>
              )}

              {/* 검색 칸 */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="역 이름으로 검색"
                    className="w-full rounded-sm border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                  />
                </div>
                <span className="shrink-0 text-sm text-gray-400">
                  전체 <span className="font-bold text-blue">{totalCount}</span>
                  개 역
                </span>
              </div>

              {/* 여행지 카드 리스트 */}
              <div className="grid grid-cols-3 gap-4">
                {!isLoaded &&
                  Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[80px] animate-pulse rounded-sm bg-gray-200"
                    />
                  ))}

                {isLoaded && paged.length === 0 && (
                  <div className="col-span-3 flex items-center justify-center py-20 text-sm text-gray-300">
                    {searchQuery
                      ? '검색 결과가 없습니다'
                      : '등록된 후기가 없습니다'}
                  </div>
                )}

                {isLoaded &&
                  paged.map(({ city, averageRating, reviewCount }) => (
                    <button
                      key={city}
                      onClick={() =>
                        navigate('/travel/review', { state: { city } })
                      }
                      className="flex items-center justify-between rounded-sm bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-gray-50"
                    >
                      {/* 좌측 */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg font-black"
                          style={{
                            backgroundColor: `${getProfileColor(city)}28`,
                            color: getProfileColor(city),
                          }}
                        >
                          {city.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-bold text-gray-900">
                            {city}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <StarRating rating={averageRating} />
                            <span className="text-xs font-bold text-gray-500">
                              {averageRating > 0
                                ? averageRating.toFixed(1)
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 우측 */}
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="text-sm font-bold text-blue">
                          {reviewCount}
                        </span>
                        <span className="text-xs text-gray-400">후기</span>
                      </div>
                    </button>
                  ))}
              </div>

              {/* 페이지네이션 */}
              {isLoaded && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={goPrev}
                    disabled={page === 1}
                    className="flex items-center justify-center rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                  >
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
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    이전
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs font-bold transition-colors ${
                        n === page
                          ? 'bg-blue text-white'
                          : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={goNext}
                    disabled={page === totalPages}
                    className="flex items-center justify-center rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                  >
                    다음
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
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCTravelReviewListPage;

/**
 * @role: pages — PC 여행지 후기 상세 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '@/shared/firebase/firebase';
import { useGetTravelReviews } from '@/features/TravelReview/hooks/useGetTravelReviews';
import StarRating from '@/shared/ui/StarRating';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { usePCTravelReviewPage } from '../hooks/usePCTravelReviewPage';
import { useMoreMenu } from '../hooks/useMoreMenu';
import { getProfileColor } from '../constants/travelReviewPageConstants';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';
import { formatReviewDate } from '@/shared/lib/formatDate';
import StarPicker from '@/shared/ui/StarPicker';

const ReviewImage = ({ src }: { src: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="mt-2">
      {!loaded && (
        <div className="h-60 w-full animate-pulse rounded-sm bg-gray-100" />
      )}
      <img
        src={src}
        alt="후기 이미지"
        className={`max-h-60 w-full rounded-sm object-cover ${loaded ? 'block' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const MoreMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { open, setOpen, ref } = useMoreMenu();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-sm p-1 text-gray-400 hover:bg-gray-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-24 overflow-hidden rounded-sm border border-gray-100 bg-white shadow-md">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="flex w-full px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
          >
            수정
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex w-full px-4 py-2 text-xs text-red hover:bg-gray-50"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

const PCTravelReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const city: string = state?.city ?? '';
  const currentUser = auth.currentUser;

  const { reviews, isLoaded, averageRating } = useGetTravelReviews(city);
  const {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editRating,
    setEditRating,
    saving,
    handleEditStart,
    handleEditSave,
    handleDelete,
    showWriteForm,
    setShowWriteForm,
    writeTitle,
    setWriteTitle,
    writeContent,
    setWriteContent,
    writeRating,
    setWriteRating,
    writePreviewImg,
    setWriteFile,
    setWritePreviewImg,
    writeFileInputRef,
    onWriteFileChange,
    submitting,
    handleWriteSubmit,
    processedReviews,
    ratingCounts,
    isLoggedIn,
  } = usePCTravelReviewPage(city, reviews);

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
                  {/* 뒤로가기 */}
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
                    여행지 후기 목록
                  </button>
                  {/* 뱃지 */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1.5 rounded-[3px] px-2 py-1"
                      style={{ backgroundColor: '#ede9fe' }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 16 16"
                        fill="#7c3aed"
                      >
                        <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Z" />
                      </svg>
                      <span
                        className="text-xs font-bold"
                        style={{ color: '#7c3aed' }}
                      >
                        여행지 후기
                      </span>
                    </div>
                  </div>
                  {/* 대제목 */}
                  <h1 className="text-2xl font-black text-gray-900">{city}</h1>
                  {/* 소제목 */}
                  <p className="text-sm text-gray-400">
                    여행지들이 남긴 생생한 후기를 확인하세요
                  </p>
                </div>
                {/* 후기 작성 / 취소 버튼 */}
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
                  {/* 사진 첨부 */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-gray-400">사진 첨부</p>
                    {writePreviewImg ? (
                      <div className="relative w-fit">
                        <img
                          src={writePreviewImg}
                          alt="미리보기"
                          className="h-[100px] w-[100px] rounded-sm border border-gray-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setWriteFile(null);
                            setWritePreviewImg(null);
                            if (writeFileInputRef.current)
                              writeFileInputRef.current.value = '';
                          }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-400 shadow hover:text-gray-600"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="review-file"
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-gray-200 py-5 transition-colors hover:border-gray-400"
                        style={{ backgroundColor: '#f8fbff' }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-400">
                          클릭하여 사진을 첨부하세요
                        </span>
                        <span className="text-xs text-gray-300">JPG, PNG</span>
                      </label>
                    )}
                    <input
                      ref={writeFileInputRef}
                      id="review-file"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={onWriteFileChange}
                      className="hidden"
                    />
                  </div>
                  <button
                    onClick={handleWriteSubmit}
                    disabled={
                      !writeTitle.trim() || !writeContent.trim() || submitting
                    }
                    className="rounded-sm bg-blue py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-30"
                  >
                    {submitting ? '등록 중...' : '등록'}
                  </button>
                </div>
              )}

              {/* 별점 카드 칸 */}
              <div className="grid grid-cols-[1fr_3fr] gap-6 overflow-hidden rounded-sm bg-white p-6 shadow-sm">
                {/* 좌측 — 평균 점수 */}
                <div className="flex flex-col items-center justify-center gap-2 border-r border-gray-100 pr-6">
                  <span className="text-5xl font-semibold text-gray-900">
                    {reviews.length > 0 ? averageRating.toFixed(1) : '-'}
                  </span>
                  <StarRating rating={averageRating} />
                  <span className="text-sm text-gray-400">
                    후기 {reviews.length}개
                  </span>
                </div>
                {/* 우측 — 별점 분포 */}
                <div className="flex flex-col justify-center gap-2 pl-2">
                  {ratingCounts.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-right text-xs font-bold text-gray-400">
                        {star}점
                      </span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-[#fbbf24] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs text-gray-400">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 검색 칸 */}
              <div className="flex items-center gap-3">
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
                    placeholder="제목, 내용으로 검색"
                    className="w-full rounded-sm border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(e.target.value as '최신순' | '별점순')
                    }
                    className="w-24 appearance-none rounded-sm border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-bold text-gray-400 outline-none"
                    style={{ textAlignLast: 'left' }}
                  >
                    <option value="최신순">최신순</option>
                    <option value="별점순">별점순</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* 게시물 칸 */}
              <div className="flex flex-col gap-3">
                {!isLoaded &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-sm bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                          <div className="flex flex-col gap-1">
                            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                            <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}

                {isLoaded && processedReviews.length === 0 && (
                  <div className="flex items-center justify-center rounded-sm bg-white py-16 text-sm text-gray-300 shadow-sm">
                    {searchQuery
                      ? '검색 결과가 없습니다'
                      : '아직 후기가 없습니다'}
                  </div>
                )}

                {isLoaded &&
                  processedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-sm bg-white p-5 shadow-sm"
                    >
                      {editingId === review.id ? (
                        <div className="flex flex-col gap-3">
                          <StarPicker
                            value={editRating}
                            onChange={setEditRating}
                          />
                          <input
                            className="w-full rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="제목"
                          />
                          <textarea
                            className="w-full rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue"
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="내용"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleEditSave}
                              disabled={saving}
                              className="flex-1 rounded-sm bg-blue py-2 text-xs font-bold text-white disabled:opacity-50"
                            >
                              {saving ? '저장 중...' : '저장'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 rounded-sm bg-gray-100 py-2 text-xs font-bold text-gray-500"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {/* 상단: 프로필 + 이름/날짜 | 별점 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* 프로필 원 */}
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                                style={{
                                  backgroundColor: getProfileColor(
                                    review.author,
                                  ),
                                }}
                              >
                                {review.author?.charAt(0) ?? '?'}
                              </div>
                              {/* 이름 + 날짜 수직 */}
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">
                                  {currentUser?.displayName === review.author
                                    ? review.author
                                    : review.author?.charAt(0) + '**'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatReviewDate(review.createdAt)}
                                  {review.updatedAt && ' · 수정됨'}
                                </span>
                              </div>
                            </div>
                            {/* 우측: 별점 + ... 메뉴 */}
                            <div className="flex items-center gap-3">
                              <StarRating rating={review.rating} />
                              {currentUser?.displayName === review.author && (
                                <MoreMenu
                                  onEdit={() =>
                                    handleEditStart(
                                      review.id,
                                      review.title,
                                      review.content,
                                      review.rating,
                                    )
                                  }
                                  onDelete={() => handleDelete(review.id)}
                                />
                              )}
                            </div>
                          </div>
                          {/* 하단: 제목 + 내용 수직 */}
                          <div className="flex flex-col gap-1">
                            <p className="text-base font-bold text-gray-800">
                              {review.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {review.content}
                            </p>
                            {review.imageUrl && (
                              <ReviewImage src={review.imageUrl} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCTravelReviewPage;

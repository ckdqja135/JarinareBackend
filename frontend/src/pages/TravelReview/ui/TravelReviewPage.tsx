/**
 * @role: pages — 여행지 후기 상세 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import backward from '@/assets/icons/backward.png';
import { auth } from '@/shared/firebase/firebase';
import { useGetTravelReviews } from '@/features/TravelReview/hooks/useGetTravelReviews';
import { useDeleteTravelReview } from '@/features/TravelReview/hooks/useDeleteTravelReview';
import { useUpdateTravelReview } from '@/features/TravelReview/hooks/useUpdateTravelReview';
import { usePagination } from '@/features/TravelReview/hooks/usePagination';
import { useSearchByContent } from '@/features/TravelReview/hooks/useSearchByContent';
import type { TravelReview } from '@/entities/TravelReview/types/travelReviewType';
import StarRating from '@/shared/ui/StarRating';
import StarPicker from '@/shared/ui/StarPicker';

const GAP = 12; // gap-3 = 12px

const formatDate = (seconds: number) => {
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const TravelReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const city: string = state?.city ?? '';

  const currentUser = auth.currentUser;
  const { reviews, isLoaded, averageRating } = useGetTravelReviews(city);
  const { deleteReview } = useDeleteTravelReview(city);
  const { updateReview } = useUpdateTravelReview(city);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 내용 검색 필터
  const { results: filteredReviews } = useSearchByContent(searchQuery, reviews);

  // 실제 DOM 높이 기반 페이지 사이즈 계산
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

  const {
    paged: pagedRaw,
    page,
    totalPages,
    goNext,
    goPrev,
  } = usePagination(filteredReviews, pageSize);
  const paged = pagedRaw as TravelReview[];
  const showPagination = isLoaded && totalPages > 1;

  const handleEditStart = (
    id: string,
    title: string,
    content: string,
    rating: number,
  ) => {
    setEditingId(id);
    setEditTitle(title);
    setEditContent(content);
    setEditRating(rating);
  };

  const handleEditSave = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    await updateReview(
      editingId,
      editTitle.trim(),
      editContent.trim(),
      editRating,
    );
    setSaving(false);
    setEditingId(null);
    navigate(0);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100">
      {/* 헤더 */}
      <div className="flex w-full shrink-0 items-center gap-4 bg-blue px-[28px] py-4">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="h-[20px] w-[12px] cursor-pointer brightness-0 invert"
        />
        <span className="text-lg font-bold text-white">{city} 후기</span>
      </div>

      {/* 평균 별점 */}
      <div className="mx-4 mt-4 shrink-0 rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-1 text-xs text-gray-400">평균 별점</p>
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} />
          <span className="text-sm font-bold text-gray-800">
            {reviews.length > 0 ? averageRating.toFixed(1) : '-'}
          </span>
          <span className="text-xs text-gray-400">
            ({reviews.length}개 후기)
          </span>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="shrink-0 px-4 pt-3">
        <input
          className="w-full rounded-2xl bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400"
          placeholder="제목, 내용으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 후기 목록 — 스크롤 영역 */}
      <div
        ref={scrollAreaRef}
        className="mt-3 flex-1 overflow-y-auto px-4 pb-4"
      >
        {!isLoaded && (
          <div className="flex h-20 items-center justify-center text-sm text-gray-400">
            불러오는 중...
          </div>
        )}
        {isLoaded && reviews.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-2xl bg-white text-sm text-gray-400 shadow-sm">
            아직 후기가 없습니다.
          </div>
        )}
        {isLoaded && reviews.length > 0 && filteredReviews.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-2xl bg-white text-sm text-gray-400 shadow-sm">
            검색 결과가 없습니다.
          </div>
        )}
        <div className="flex flex-col gap-3">
          {paged.map((review, i) => (
            <div
              key={review.id}
              ref={i === 0 ? firstCardRef : undefined}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              {editingId === review.id ? (
                /* 수정 폼 */
                <div className="flex flex-col gap-2">
                  <StarPicker value={editRating} onChange={setEditRating} />
                  <input
                    className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSave}
                      disabled={saving}
                      className="flex-1 rounded-xl bg-blue py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-bold text-gray-500"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                /* 후기 카드 */
                <>
                  <div className="mb-1 flex items-center justify-between">
                    <StarRating rating={review.rating} />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">
                        {currentUser?.displayName === review.author
                          ? review.author
                          : '***'}
                      </span>
                      {currentUser?.displayName === review.author && (
                        <>
                          <button
                            onClick={() =>
                              handleEditStart(
                                review.id,
                                review.title,
                                review.content,
                                review.rating,
                              )
                            }
                            className="text-[10px] text-blue underline"
                          >
                            수정
                          </button>
                          <button
                            onClick={async () => {
                              await deleteReview(review.id);
                              navigate(0);
                            }}
                            className="text-[10px] text-red underline"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    {review.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{review.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                    {review.updatedAt && (
                      <span className="text-[10px] text-gray-400">
                        · 수정됨 {formatDate(review.updatedAt)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
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

export default TravelReviewPage;

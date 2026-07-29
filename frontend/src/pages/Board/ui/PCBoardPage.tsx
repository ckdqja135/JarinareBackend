/**
 * @role: pages — PC 게시판 허브 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import TravelReviewTicker from '@/widgets/TravelReview/ui/TravelReviewTicker';
import { usePCBoardPage } from '../hooks/usePCBoardPage';
import { useBoardCounts } from '@/features/Board/hooks/useBoardCounts';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import {
  BOARD_CATEGORIES,
  FILTER_TABS,
  CAT_STYLE_MAP,
} from '../constants/boardPageConstants';

const PCBoardPage = () => {
  const navigate = useNavigate();
  const rightColRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleClearSearch,
    activeSearchQuery,
    searchResults,
    activeFilter,
    setActiveFilter,
    isNew,
    formatDate,
    totalReviewCount,
    displayPosts,
    currentPage,
    setCurrentPage,
    isLoading,
    topPosts,
    top3DocIds,
    pagedPosts,
    showPagination,
    visiblePages,
    totalPages,
    rightColH,
    viewsMap,
  } = usePCBoardPage(rightColRef);

  const { counts } = useBoardCounts();
  const { markSeen } = useBoardSeen();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-32 pb-16 pt-10">
            <div className="mb-6">
              <p className="text-xs font-bold tracking-widest text-gray-400">
                COMMUNITY
              </p>
              <h1 className="mt-1 text-2xl font-black text-gray-900">게시판</h1>
              <p className="mt-1 text-sm text-gray-400">
                다양한 여행 정보와 소식을 확인하세요
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* 이벤트 */}
              <SeasonBanner />

              {/* 베스트 여행지 후기 */}
              <div className="overflow-hidden">
                <TravelReviewTicker title="베스트 여행지 후기" />
              </div>

              {/* 2열 그리드 — 왼쪽 4fr(통합게시판), 오른쪽 1fr(인기게시물+카테고리) */}
              <div className="grid grid-cols-[4fr_1fr] items-start gap-6">
                {/* [col1] 통합게시판 */}
                <div
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  style={showPagination ? { height: rightColH } : undefined}
                >
                  {/* 카드 헤더: 제목 + 필터 탭 + 글쓰기 버튼 */}
                  <div className="flex items-center gap-2 px-5 py-4">
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-900">
                      통합게시판
                    </h2>
                    <div className="ml-auto flex items-center gap-2">
                      <form onSubmit={handleSearch} className="relative">
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
                          placeholder="게시물 검색"
                          className="rounded-md border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </form>
                      <div className="flex items-center gap-1 rounded-sm bg-gray-100 p-1">
                        {FILTER_TABS.map(({ label }) => (
                          <button
                            key={label}
                            onClick={() => setActiveFilter(label)}
                            className={`rounded-sm px-4 py-1.5 text-sm font-bold transition-colors ${
                              activeFilter === label
                                ? 'bg-blue text-white'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate('/board/write')}
                        className="flex items-center gap-1.5 rounded-sm bg-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue/90"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                        글쓰기
                      </button>
                    </div>
                  </div>

                  {/* 게시물 행 */}
                  <div className="flex flex-1 flex-col overflow-hidden bg-white">
                    {activeSearchQuery ? (
                      searchResults.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center py-10 text-sm text-gray-300">
                          검색 결과가 없습니다
                        </div>
                      ) : (
                        searchResults.map((post) => {
                          const style = CAT_STYLE_MAP[post._category];
                          return (
                            <button
                              key={post.id}
                              onClick={() =>
                                navigate(style.path, {
                                  state: { [style.stateKey]: post },
                                })
                              }
                              className="relative flex w-full items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                            >
                              <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                              <span
                                className="w-[44px] shrink-0 rounded-[3px] px-1.5 py-0.5 text-center text-[10px] font-bold"
                                style={{
                                  backgroundColor: style.bgColor,
                                  color: style.textColor,
                                }}
                              >
                                {style.badge}
                              </span>
                              <span className="flex-1 truncate text-base font-bold text-gray-800">
                                {post.title}
                              </span>
                              <span className="w-[56px] shrink-0 truncate text-right text-sm text-gray-400">
                                {post.author}
                              </span>
                              <span className="w-[52px] shrink-0 text-right text-sm text-gray-400">
                                {formatDate(post.createdAt)}
                              </span>
                            </button>
                          );
                        })
                      )
                    ) : isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="relative flex items-center gap-6 px-5 py-4"
                        >
                          <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                          <div className="h-5 w-12 animate-pulse rounded-[3px] bg-gray-100" />
                          <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                        </div>
                      ))
                    ) : displayPosts.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center py-10 text-sm text-gray-300">
                        게시물이 없습니다
                      </div>
                    ) : (
                      pagedPosts.map((post) => {
                        const style = CAT_STYLE_MAP[post._category];
                        const isHot = top3DocIds.has(
                          post.id.split('/').pop() ?? '',
                        );
                        const hasNew = isNew(post.createdAt, post._category);
                        return (
                          <button
                            key={post.id}
                            onClick={() => {
                              if (hasNew)
                                markSeen(
                                  post._category as
                                    | 'notice'
                                    | 'event'
                                    | 'board',
                                );
                              navigate(style.path, {
                                state: {
                                  [style.stateKey]: {
                                    id: post.id,
                                    title: post.title,
                                    content: post.content,
                                    author: post.author,
                                    likes: post.likes,
                                    views: post.views,
                                    createdAt: post.createdAt,
                                    imageUrl: post.imageUrl,
                                  },
                                },
                              });
                            }}
                            className="relative flex w-full items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                          >
                            <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                            <span
                              className="w-[44px] shrink-0 rounded-[3px] px-1.5 py-0.5 text-center text-[10px] font-bold"
                              style={{
                                backgroundColor: style.bgColor,
                                color: style.textColor,
                              }}
                            >
                              {style.badge}
                            </span>
                            <span className="flex-1 truncate text-base font-bold text-gray-800">
                              {post.title}
                              {(post.commentCount ?? 0) > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center align-middle text-sm font-bold text-blue">
                                  [{post.commentCount}]
                                </span>
                              )}
                              {isHot && (
                                <span className="ml-2 inline-flex items-center justify-center rounded-[3px] bg-red px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">
                                  HOT
                                </span>
                              )}
                              {hasNew && !isHot && (
                                <span className="ml-2 inline-flex items-center justify-center rounded-[3px] bg-lightImpossible px-1.5 py-0.5 align-middle text-[10px] font-bold text-red">
                                  NEW
                                </span>
                              )}
                            </span>
                            <span className="w-[56px] shrink-0 truncate text-right text-sm text-gray-400">
                              {post.author}
                            </span>
                            <span className="w-[52px] shrink-0 text-right text-sm text-gray-400">
                              {formatDate(post.createdAt)}
                            </span>
                            <span className="w-[28px] shrink-0 text-right text-sm text-gray-400">
                              {viewsMap[post.id] ?? post.views ?? 0}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* 페이지네이션 — 게시물이 많을 때만 표시 */}
                  {showPagination && (
                    <div className="flex items-center justify-center gap-1.5 px-5 py-4">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0}
                        className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      {visiblePages.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-colors ${
                            page === currentPage
                              ? 'bg-blue text-white'
                              : 'text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages - 1, currentPage + 1),
                          )
                        }
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center justify-center px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg
                          width="16"
                          height="16"
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

                {/* [col2] 실시간 인기 게시물 + 카테고리 (세로 적층) */}
                <div ref={rightColRef} className="flex min-w-0 flex-col gap-6">
                  {/* 실시간 인기 */}
                  <div className="flex flex-col overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <h2 className="text-lg font-bold text-gray-800">
                        실시간 인기
                      </h2>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const post = topPosts[i];
                        const rankColor =
                          i === 0
                            ? '#ef4444'
                            : i === 1
                              ? '#f97316'
                              : i === 2
                                ? '#ca8a04'
                                : '#9ca3af';
                        if (!post) {
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 py-3"
                            >
                              <span
                                className="w-4 shrink-0 text-center text-sm font-black"
                                style={{ color: rankColor }}
                              >
                                {i + 1}
                              </span>
                              <span className="flex-1 truncate text-xs text-gray-300">
                                -
                              </span>
                            </div>
                          );
                        }
                        const categoryLabel =
                          post.category === 'board' ? '자유' : post.category === 'event' ? '이벤트' : '공지';
                        const detailPath =
                          post.category === 'board'
                            ? '/board/board/detail'
                            : post.category === 'event'
                              ? '/board/event/detail'
                              : '/board/notice/detail';
                        const detailState =
                          post.category === 'board'
                            ? { post: { id: post.id, title: post.title, content: post.content, author: post.author, likes: 0, views: post.viewCount, createdAt: 0, imageUrl: null } }
                            : post.category === 'event'
                              ? { event: { id: post.id, title: post.title, content: post.content, author: post.author, likes: 0, views: post.viewCount, createdAt: 0, imageUrl: null } }
                              : { notice: { id: post.id, title: post.title, content: post.content, author: post.author, likes: 0, views: post.viewCount, createdAt: 0, imageUrl: null } };
                        return (
                          <button
                            key={post.id}
                            onClick={() => navigate(detailPath, { state: detailState })}
                            className="flex w-full items-start gap-2.5 overflow-hidden py-3 text-left"
                          >
                            <span
                              className="mt-0.5 w-4 shrink-0 text-center text-sm font-black"
                              style={{ color: rankColor }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate text-base font-semibold text-gray-800">
                                {post.title}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {categoryLabel} - {post.viewCount}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 카테고리 */}
                  <div className="flex flex-col overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-800">
                        카테고리
                      </h2>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100">
                      {BOARD_CATEGORIES.map(({ key, label, path }) => (
                        <button
                          key={key}
                          onClick={() => navigate(path)}
                          className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:opacity-70"
                        >
                          <span className="flex-1 text-sm text-gray-800">
                            {label}
                          </span>
                          <span className="rounded-md bg-lightBlue px-2 py-0.5 text-[10px] font-bold text-blue">
                            {key === 'review'
                              ? totalReviewCount
                              : counts[key as keyof typeof counts]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCBoardPage;

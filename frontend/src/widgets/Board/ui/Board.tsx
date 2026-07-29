/**
 * @role: widgets — 자유게시판 게시물 목록
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SortOrder, BoardProps } from '../types/boardWidgetType';
import { useBoard } from '../hooks/useBoard';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'views', label: '조회수' },
  { value: 'likes', label: '좋아요' },
];

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const BoardImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full">
      {!loaded && <div className="h-60 w-full animate-pulse bg-gray-100" />}
      <img
        src={src}
        alt={alt}
        className={`w-full object-contain ${loaded ? 'block' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const BoardSkeleton = () => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
    <div className="flex items-center gap-x-4 px-4 py-3">
      <div className="h-[36px] w-[36px] animate-pulse rounded-lg bg-gray-200" />
      <div className="flex flex-1 flex-col gap-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-2.5 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
    <div className="space-y-2 px-4 pb-4">
      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const Board = ({
  isPC = false,
  externalSearchQuery,
  externalSortOrder,
}: BoardProps) => {
  const navigate = useNavigate();

  const {
    internalSearchQuery,
    setInternalSearchQuery,
    sortOrder,
    setSortOrder,
    filterOpen,
    setFilterOpen,
    menuOpenId,
    setMenuOpenId,
    searchQuery,
    ref,
    items,
    isFetching,
    likesMap,
    viewsMap,
    displayedItems,
    handleDelete,
    currentUid,
  } = useBoard(isPC, externalSearchQuery, externalSortOrder);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label;

  if (isPC) {
    return (
      <div>
        {/* PC 게시물 목록 */}
        <div className="flex flex-col gap-3">
          {items.length === 0 && isFetching ? (
            [...Array(3)].map((_, idx) => <BoardSkeleton key={idx} />)
          ) : displayedItems.length === 0 ? (
            <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
              <span className="text-2xl">📭</span>
              <span className="text-sm font-semibold text-gray-400">
                {searchQuery
                  ? '검색 결과가 없습니다'
                  : '등록된 게시글이 없습니다'}
              </span>
            </div>
          ) : (
            displayedItems.map((post) => {
              const likesCount = likesMap[post.id] ?? post.likes ?? 0;
              const commentCount = post.commentCount ?? 0;
              const isOwner = currentUid === post.id.split('/')[1];

              return (
                <div
                  key={post.id}
                  className="cursor-pointer overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md"
                  onClick={() =>
                    navigate('/board/board/detail', { state: { post } })
                  }
                >
                  {/* 상단 영역 (3fr) */}
                  <div className="px-5 pb-3 pt-5">
                    {/* 헤더: 프로필 + 이름/날짜 + 자유뱃지 + ★ + ··· */}
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{
                          backgroundColor: getProfileColor(post.author ?? ''),
                        }}
                      >
                        {post.author?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-800">
                          {post.author}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatBoardTime(post.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 transition-colors hover:text-yellow-500"
                      >
                        <StarIcon />
                      </button>
                      {isOwner && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(
                                menuOpenId === post.id ? null : post.id,
                              );
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                          >
                            ···
                          </button>
                          {menuOpenId === post.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                }}
                              />
                              <div className="absolute right-0 top-8 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/board/board', { state: { editPost: post } });
                                  }}
                                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(post);
                                  }}
                                  className="hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm text-red"
                                >
                                  삭제
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* 제목 */}
                    <div className="mb-1 text-base font-bold text-gray-900">
                      {post.title}
                    </div>
                    {/* 내용 */}
                    <div className="line-clamp-2 text-sm text-gray-500">
                      {post.content}
                    </div>
                  </div>
                  {post.imageUrl && (
                    <BoardImage src={post.imageUrl} alt={post.title} />
                  )}

                  {/* 하단 영역 (1fr) */}
                  <div className="flex items-center gap-4 border-t border-gray-50 px-5 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                      <HeartIcon />
                      <span>좋아요</span>
                      <span>{likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                      <CommentIcon />
                      <span>댓글</span>
                      <span>{commentCount}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={ref} className="h-10" />
        </div>

      </div>
    );
  }

  return (
    <div className="mb-[100px]">
      {/* 검색 + 필터 */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <input
          type="text"
          value={internalSearchQuery}
          onChange={(e) => setInternalSearchQuery(e.target.value)}
          placeholder="제목, 내용, 작성자 검색 / #태그 검색"
          className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400"
        />
        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-1 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 shadow-sm"
          >
            <FilterIcon />
            <span>{currentLabel}</span>
          </button>
          {filterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                <div className="flex flex-nowrap gap-2 p-2">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setSortOrder(value);
                        setFilterOpen(false);
                      }}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                        sortOrder === value
                          ? 'bg-blue text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className="mt-3 space-y-3 px-4">
        {items.length === 0 && isFetching ? (
          [...Array(3)].map((_, idx) => <BoardSkeleton key={idx} />)
        ) : displayedItems.length === 0 ? (
          <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2">
            <span className="text-2xl">📭</span>
            <span className="text-sm font-semibold text-gray-400">
              {internalSearchQuery
                ? '검색 결과가 없습니다'
                : '등록된 게시글이 없습니다'}
            </span>
          </div>
        ) : (
          displayedItems.map((post) => {
            const likesCount = likesMap[post.id] ?? post.likes ?? 0;
            const isOwner = currentUid === post.id.split('/')[1];

            return (
              <div
                key={post.id}
                className="relative cursor-pointer rounded-xl bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                onClick={() =>
                  navigate('/board/board/detail', { state: { post } })
                }
              >
                <div className="flex items-center gap-x-4 px-4 py-3">
                  <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-gray-300">
                    <span className="text-sm font-bold text-white">
                      {post.author?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-y-[2px]">
                    <span className="text-base font-bold text-black">
                      {post.author}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatBoardTime(post.createdAt)}
                    </span>
                  </div>
                  <div className="bg-blue-500 rounded px-2 py-0.5 text-xs font-bold text-white">
                    자유
                  </div>
                  {isOwner && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === post.id ? null : post.id,
                          );
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                      >
                        <HamburgerIcon />
                      </button>
                      {menuOpenId === post.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/board/board', { state: { editPost: post } });
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(post);
                              }}
                              className="text-red-500 hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {post.imageUrl && (
                  <BoardImage src={post.imageUrl} alt={post.title} />
                )}

                <div className="px-4 pb-1 pt-1 text-sm font-semibold">
                  {post.title}
                </div>
                <div className="line-clamp-2 px-4 pb-2 text-sm text-gray-600">
                  {post.content}
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base text-gray-400">🤍</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {likesCount}명이 좋아합니다
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>조회수</span>
                    <span>{viewsMap[post.id] ?? 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={ref} className="h-10" />
      </div>
    </div>
  );
};

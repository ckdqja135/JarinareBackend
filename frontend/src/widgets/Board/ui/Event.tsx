/**
 * @role: widgets — 이벤트 게시물 목록
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../hooks/useEvent';

type SortOrder = 'newest' | 'oldest';

const GiftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="72"
    height="72"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3b82f6"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

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

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

const EventCardTop = () => (
  <div className="flex w-full items-center justify-center bg-blue/10 py-10">
    <GiftIcon />
  </div>
);

const EventCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
    <div className="h-[152px] w-full animate-pulse bg-gray-200" />
    <div className="p-5">
      <div className="mb-2 h-4 w-12 animate-pulse rounded bg-gray-200" />
      <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="mb-1.5 h-3 w-1/3 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

interface EventProps {
  isPC?: boolean;
  externalSearchQuery?: string;
  externalSortOrder?: SortOrder;
}

export const Event = ({
  isPC = false,
  externalSearchQuery,
  externalSortOrder,
}: EventProps) => {
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
    displayedItems,
    handleDelete,
    currentUid,
  } = useEvent(isPC, externalSearchQuery, externalSortOrder);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label;

  if (isPC) {
    return (
      <>
        {items.length === 0 && isFetching ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, idx) => <EventCardSkeleton key={idx} />)}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
            <span className="text-2xl">📭</span>
            <span className="text-sm font-semibold text-gray-400">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 이벤트가 없습니다'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {displayedItems.map((event) => {
              const isOwner = currentUid === event.id.split('/')[1];
              return (
                <div
                  key={event.id}
                  className="relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => navigate('/board/event/detail', { state: { event } })}
                >
                  <EventCardTop />
                  <div className="p-5">
                    <span className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: '#fef9c3', color: '#ca8a04' }}>이벤트</span>
                    <h3 className="line-clamp-2 text-base font-bold text-gray-900">{event.title}</h3>
                    <div className="mt-3 text-sm text-gray-400">{formatBoardTime(event.createdAt)}</div>
                    <div className="mt-1.5 text-sm text-gray-500">{event.author}</div>
                  </div>
                  {isOwner && (
                    <div className="absolute right-2 top-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === event.id ? null : event.id); }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs text-gray-500 hover:bg-white"
                      >
                        ···
                      </button>
                      {menuOpenId === event.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                          <div className="absolute right-0 top-7 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/board/event', { state: { editPost: event } }); setMenuOpenId(null); }}
                              className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(event); }}
                              className="block w-full px-4 py-2.5 text-left text-sm text-red hover:bg-gray-50"
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div ref={ref} className="h-10" />
      </>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        {/* 검색 + 필터 */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <input
            type="text"
            value={internalSearchQuery}
            onChange={(e) => setInternalSearchQuery(e.target.value)}
            placeholder="제목, 내용 검색"
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
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-10 z-20 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                  <div className="flex flex-nowrap gap-2 p-2">
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setSortOrder(value); setFilterOpen(false); }}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${sortOrder === value ? 'bg-blue text-white' : 'bg-gray-200 text-gray-600'}`}
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
        <div className="p-4 pt-3">
          {items.length === 0 && isFetching ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, idx) => <EventCardSkeleton key={idx} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2">
              <span className="text-2xl">📭</span>
              <span className="text-sm font-semibold text-gray-400">
                {internalSearchQuery ? '검색 결과가 없습니다' : '등록된 이벤트가 없습니다'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map((event) => (
                <div
                  key={event.id}
                  className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                  onClick={() => navigate('/board/event/detail', { state: { event } })}
                >
                  <EventCardTop />
                  <div className="p-5">
                    <span className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: '#fef9c3', color: '#ca8a04' }}>이벤트</span>
                    <h3 className="line-clamp-2 text-xs font-bold text-gray-900">{event.title}</h3>
                    <div className="mt-3 text-xs text-gray-400">{formatBoardTime(event.createdAt)}</div>
                    <div className="mt-1.5 text-xs text-gray-500">{event.author}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={ref} className="h-10" />
        </div>
      </div>
    </div>
  );
};

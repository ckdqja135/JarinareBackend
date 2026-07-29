/**
 * @role: pages — PC 공지사항 목록 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { usePCNoticeListPage } from '../hooks/usePCNoticeListPage';

const PCNoticeListPage = () => {
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    pagedData,
    filteredData,
    totalPages,
    visiblePages,
    isLoading,
    viewsMap,
    isAdmin,
    formatDate,
  } = usePCNoticeListPage();

  const showPagination = totalPages > 1;

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
            <div className="flex flex-col gap-4">
              {/* 헤더 */}
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
                  <h1 className="text-2xl font-black text-gray-900">공지사항</h1>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/board/notice')}
                    className="flex items-center gap-2 rounded-sm bg-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue/90"
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
                    글쓰기
                  </button>
                )}
              </div>

              {/* 검색 + 정렬 */}
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="제목, 내용 검색"
                    className="w-full rounded-sm border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue"
                  />
                </div>
                <div className="relative shrink-0">
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as 'newest' | 'oldest')
                    }
                    className="w-24 appearance-none rounded-sm border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-bold text-gray-400 outline-none"
                    style={{ textAlignLast: 'left' }}
                  >
                    <option value="newest">최신순</option>
                    <option value="oldest">오래된순</option>
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

              {/* 게시물 카드 */}
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                {/* 컬럼 헤더 */}
                <div className="flex items-center gap-6 border-b border-gray-100 px-5 py-3">
                  <span className="w-[40px] shrink-0 text-center text-xs font-bold text-gray-400">
                    번호
                  </span>
                  <span className="flex-1 text-xs font-bold text-gray-400">
                    제목
                  </span>
                  <span className="w-[56px] shrink-0 text-right text-xs font-bold text-gray-400">
                    작성자
                  </span>
                  <span className="w-[52px] shrink-0 text-right text-xs font-bold text-gray-400">
                    날짜
                  </span>
                  <span className="w-[32px] shrink-0 text-right text-xs font-bold text-gray-400">
                    조회
                  </span>
                </div>

                {/* 게시물 행 */}
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="relative flex items-center gap-6 px-5 py-4"
                    >
                      <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                      <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                      <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                      <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                      <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                    </div>
                  ))
                ) : filteredData.length === 0 ? (
                  <div className="flex h-[200px] flex-col items-center justify-center">
                    <span className="text-sm text-gray-300">
                      {searchQuery
                        ? '검색 결과가 없습니다'
                        : '등록된 공지사항이 없습니다'}
                    </span>
                  </div>
                ) : (
                  pagedData.map((notice, index) => {
                    const postNumber =
                      filteredData.length - currentPage * 10 - index;

                    return (
                      <button
                        key={notice.id}
                        onClick={() =>
                          navigate('/board/notice/detail', {
                            state: { notice },
                          })
                        }
                        className="relative flex w-full items-center gap-6 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="absolute inset-x-5 bottom-0 border-b border-gray-100" />
                        <span className="w-[40px] shrink-0 text-center text-sm text-gray-400">
                          {postNumber}
                        </span>
                        <span className="flex-1 truncate text-base font-bold text-gray-800">
                          {notice.title}
                        </span>
                        <span className="w-[56px] shrink-0 truncate text-right text-sm text-gray-400">
                          {notice.author}
                        </span>
                        <span className="w-[52px] shrink-0 text-right text-sm text-gray-400">
                          {formatDate(notice.createdAt)}
                        </span>
                        <span className="w-[32px] shrink-0 text-right text-sm text-gray-400">
                          {viewsMap[notice.id] ?? 0}
                        </span>
                      </button>
                    );
                  })
                )}

                {/* 페이지네이션 */}
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
            </div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default PCNoticeListPage;

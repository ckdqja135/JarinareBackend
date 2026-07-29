/**
 * @role: pages — PC 이벤트 목록 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { Event } from '@/widgets/Board/ui/Event';
import { usePCEventListPage } from '../hooks/usePCEventListPage';

const PCEventListPage = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, sortOrder, setSortOrder, isAdmin } =
    usePCEventListPage();

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
              {/* 제목칸 */}
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
                  <h1 className="text-2xl font-black text-gray-900">이벤트</h1>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/board/event')}
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
                    className="w-28 appearance-none rounded-sm border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-bold text-gray-400 outline-none"
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

              {/* 게시물 칸 */}
              <Event
                isPC
                externalSearchQuery={searchQuery}
                externalSortOrder={sortOrder}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCEventListPage;

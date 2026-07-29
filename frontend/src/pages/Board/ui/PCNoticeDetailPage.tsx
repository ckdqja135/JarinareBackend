/**
 * @role: pages — PC 공지사항 상세 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { usePCNoticeDetailPage } from '../hooks/usePCNoticeDetailPage';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';


const OwnerMenu = ({
  menuOpen,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: {
  menuOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
    >
      ···
    </button>
    {menuOpen && (
      <>
        <div className="fixed inset-0 z-10" onClick={onClose} />
        <div className="absolute right-0 top-9 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
          >
            수정
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm text-red"
          >
            삭제
          </button>
        </div>
      </>
    )}
  </div>
);

const PCNoticeDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice as BoardPost | undefined;

  const {
    currentNotice,
    isOwner,
    viewCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleEdit,
  } = usePCNoticeDetailPage(notice);

  if (!currentNotice) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50">
        <PCTopNav />
        <div className="flex w-full flex-1 gap-0">
          <PCSidebar />
          <main className="flex flex-1 items-center justify-center">
            <p className="text-gray-400">게시글을 찾을 수 없습니다.</p>
          </main>
        </div>
      </div>
    );
  }

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
            {/* 뒤로가기 */}
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
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
              공지사항
            </button>

            <div className="flex flex-col gap-4">
              {/* 게시물 카드 */}
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* 제목칸 */}
                <div className="px-8 pb-6 pt-8">
                  <div className="flex flex-col gap-3">
                    {/* 공지 뱃지 */}
                    <span
                      className="w-fit rounded px-2 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
                    >
                      공지
                    </span>
                    {/* 제목 */}
                    <h1 className="text-2xl font-black leading-snug text-gray-900">
                      {currentNotice.title}
                    </h1>
                    {/* 프로필 + ··· */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{
                            backgroundColor: getProfileColor(
                              currentNotice.author ?? '',
                            ),
                          }}
                        >
                          {currentNotice.author?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-gray-800">
                            {currentNotice.author}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatBoardTime(currentNotice.createdAt)} · 조회{' '}
                            {viewCount}
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <OwnerMenu
                          menuOpen={menuOpen}
                          onToggle={() => setMenuOpen((v) => !v)}
                          onClose={() => setMenuOpen(false)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 구분 바 */}
                <div className="mx-8 h-px bg-gray-100" />

                {/* 내용칸 */}
                <div className="px-8 pb-8 pt-6">
                  {currentNotice.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={currentNotice.imageUrl}
                        alt={currentNotice.title}
                        className="w-full object-contain"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                    {currentNotice.content}
                  </p>

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCNoticeDetailPage;

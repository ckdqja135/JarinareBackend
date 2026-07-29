/**
 * @role: pages — PC 자유게시판 상세 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { CommentSection } from '@/widgets/Board/ui/CommentSection';
import { usePCBoardDetailPage } from '../hooks/usePCBoardDetailPage';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LinkIcon = () => (
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

const PCBoardDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post as BoardPost | undefined;

  const {
    currentPost,
    postDocId,
    isOwner,
    isLiked,
    likesCount,
    viewCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleEdit,
    handleLike,
    isFollowing,
    followLoading,
    toggleFollow,
  } = usePCBoardDetailPage(post);

  if (!currentPost) {
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
              자유게시판
            </button>

            <div className="flex flex-col gap-4">
              {/* 게시물 카드 */}
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* 제목칸 */}
                <div className="px-8 pb-6 pt-8">
                  <div className="flex flex-col gap-3">
                    {/* 1행: 자유 뱃지 */}
                    <span
                      className="w-fit rounded px-2 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
                    >
                      자유
                    </span>
                    {/* 2행: 제목 */}
                    <h1 className="text-2xl font-black leading-snug text-gray-900">
                      {currentPost.title}
                    </h1>
                    {/* 3행: 프로필 + 팔로우 + ··· 버튼 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{
                            backgroundColor: getProfileColor(
                              currentPost.author ?? '',
                            ),
                          }}
                        >
                          {currentPost.author?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-gray-800">
                            {currentPost.author}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatBoardTime(currentPost.createdAt)} · 조회{' '}
                            {viewCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isOwner && (
                          <button
                            onClick={toggleFollow}
                            disabled={followLoading}
                            className={`rounded-sm px-4 py-1.5 text-sm font-bold transition-colors disabled:opacity-50 ${
                              isFollowing
                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                : 'bg-lightBlue text-blue hover:bg-lightBlueImpossible'
                            }`}
                          >
                            {isFollowing ? '팔로잉' : '팔로우'}
                          </button>
                        )}
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
                </div>

                {/* 좌우 공백 구분 바 */}
                <div className="mx-8 h-px bg-gray-100" />

                {/* 내용칸 */}
                <div className="px-8 pb-8 pt-6">
                  {currentPost.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={currentPost.imageUrl}
                        alt={currentPost.title}
                        className="w-full object-contain"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                    {currentPost.content}
                  </p>

                  {/* 해시태그 */}
                  {currentPost.tags && currentPost.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {currentPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 액션 버튼 수평 정렬 */}
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${isLiked ? 'border-blue bg-blue text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-blue hover:bg-lightBlue hover:text-blue'}`}
                    >
                      <HeartIcon filled={isLiked} />
                      <span>좋아요</span>
                      <span className="text-xs">{likesCount}</span>
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-lightBlue hover:text-blue">
                      <LinkIcon />
                      <span>공유</span>
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-yellow-50 hover:text-yellow-500">
                      <StarIcon />
                      <span>즐겨찾기</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 댓글 카드 */}
              <div className="overflow-hidden rounded-xl bg-white">
                <CommentSection postDocId={postDocId} isPC />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCBoardDetailPage;

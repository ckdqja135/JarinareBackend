/**
 * @role: pages — 이벤트 상세 페이지 (PC + 모바일)
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { BoardPost } from '@/entities/Board/types/boardType';
import PCEventDetailPage from './PCEventDetailPage';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { auth } from '@/shared/firebase/firebase';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

const EventDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event as BoardPost | undefined;

  const [menuOpen, setMenuOpen] = useState(false);

  const post = event;

  const { deletePost } = useDeletePost();

  if (!post) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentUid = auth.currentUser?.uid;
  const isOwner = !!currentUid && !!post.authorUid && post.authorUid === currentUid;

  const handleDelete = async () => {
    await deletePost('event', post.id);
    navigate(-1);
  };

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCEventDetailPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex h-screen w-full flex-col lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-4 pl-[28px] pr-[27px]">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">이벤트</h1>
          {isOwner ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <HamburgerIcon />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        navigate('/board/event', { state: { editPost: post } });
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-500 hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-[12px]" />
          )}
        </div>

        {/* 게시글 내용 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mb-4 bg-white">
            {/* 작성자 정보 */}
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
            </div>

            {/* 이미지 */}
            {post.imageUrl && (
              <div className="w-full">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full object-contain"
                />
              </div>
            )}


            {/* 제목 & 내용 */}
            <div className="px-4 pb-2 text-sm">
              <span className="mr-2 font-semibold">{post.author}</span>
              {post.title}
            </div>
            <div className="px-4 pb-4 text-sm text-gray-800">
              {post.content}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default EventDetailPage;

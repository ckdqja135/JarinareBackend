/**
 * @role: pages — 모바일 게시판 허브 페이지
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { useLatestPosts } from '@/features/Board/hooks/useLatestPosts';
import { useTopViewedPost } from '@/features/Board/hooks/useTopViewedPost';
import TravelReviewTicker from '@/widgets/TravelReview/ui/TravelReviewTicker';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import { useNavigate } from 'react-router-dom';
import PCBoardPage from './PCBoardPage';

const BOARDS = [
  {
    key: 'notice' as const,
    label: '공지사항',
    path: '/board/noticelist',
  },
  {
    key: 'event' as const,
    label: '이벤트',
    path: '/board/eventlist',
  },
  {
    key: 'board' as const,
    label: '자유게시판',
    path: '/board/boardlist',
  },
];

const BoardPage = () => {
  const navigate = useNavigate();
  const { latest } = useLatestPosts();
  const { seenData } = useBoardSeen();
  const { topPosts } = useTopViewedPost();
  const topPost = topPosts[0] ?? null;

  const isNew = (
    createdAt: number | undefined,
    category: keyof typeof seenData,
  ) => {
    if (!createdAt) return false;
    return createdAt > (seenData[category] ?? 0);
  };

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardPage />
      </div>
      <div className="relative flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center gap-4 bg-gray-100 px-[28px] py-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">게시판</h1>
        </div>

        {/* 여행지 후기 */}
        <TravelReviewTicker />

        {/* 계절 할인 배너 */}
        <div className="px-4 py-2">
          <SeasonBanner />
        </div>

        {/* 게시판 목록 */}
        <div className="p-4">
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm">
            {BOARDS.map(({ key, label, path }) => {
              const post = latest[key];
              const hasNew = isNew(post?.createdAt, key);

              return (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-left transition-colors active:bg-gray-200"
                >
                  {/* 왼쪽: 게시판 이름 */}
                  <span className="w-[72px] shrink-0 text-sm font-bold text-blue">
                    {label}
                  </span>

                  {/* 구분선 */}
                  <div className="h-3 w-[1px] shrink-0 bg-gray-300" />

                  {/* 가운데: 최신 게시물 내용 */}
                  <span className="flex-1 truncate text-xs text-gray-400">
                    {post
                      ? post.content || post.title
                      : '등록된 게시물이 없습니다'}
                  </span>

                  {/* 오른쪽: N 배지 + 화살표 */}
                  <div className="flex shrink-0 items-center gap-2">
                    {hasNew && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-white">
                        N
                      </span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-300"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 실시간 조회수 1위 */}
        <div className="px-4">
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <span className="text-sm font-bold text-gray-800">
              실시간 인기 게시물
            </span>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {topPost ? (
              <button
                onClick={() => {
                  const detailPath =
                    topPost.category === 'board'
                      ? '/board/board/detail'
                      : topPost.category === 'event'
                        ? '/board/event/detail'
                        : '/board/notice/detail';
                  const detailState =
                    topPost.category === 'board'
                      ? { post: { id: topPost.id, title: topPost.title, content: topPost.content, author: topPost.author, likes: 0, views: topPost.viewCount, createdAt: 0, imageUrl: null } }
                      : topPost.category === 'event'
                        ? { event: { id: topPost.id, title: topPost.title, content: topPost.content, author: topPost.author, likes: 0, views: topPost.viewCount, createdAt: 0, imageUrl: null } }
                        : { notice: { id: topPost.id, title: topPost.title, content: topPost.content, author: topPost.author, likes: 0, views: topPost.viewCount, createdAt: 0, imageUrl: null } };
                  navigate(detailPath, { state: detailState });
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-left"
              >
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <span className="truncate text-sm font-semibold text-gray-800">
                    {topPost.title}
                  </span>
                  <span className="truncate text-xs text-gray-400">
                    {topPost.content}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] font-semibold text-blue">
                    {topPost.category === 'board' ? '자유게시판' : '이벤트'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    조회 {topPost.viewCount}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex h-12 items-center justify-center text-xs text-gray-400">
                조회수 데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardPage;

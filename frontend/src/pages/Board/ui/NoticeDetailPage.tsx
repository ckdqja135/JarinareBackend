import backward from '@/assets/icons/backward.png';
import { BoardPost } from '@/entities/Board/types/boardType';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { useNavigate, useLocation } from 'react-router-dom';

const NoticeDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice as BoardPost | undefined;

  if (!notice) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      {/* 헤더 */}
      <div className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-4 pl-[28px] pr-[27px]">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="h-[20px] w-[12px] cursor-pointer"
        />
        <h1 className="text-lg font-bold">공지사항</h1>
        <div className="w-[12px]" />
      </div>

      {/* 게시글 내용 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mb-4 bg-white">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3 p-4 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue">
              <span className="text-sm font-bold text-white">관</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">관리자</span>
                <div className="bg-red-500 rounded px-2 py-0.5 text-xs font-bold text-white">
                  공지
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatBoardTime(notice.createdAt)}
              </span>
            </div>
          </div>

          {/* 이미지 */}
          {notice.imageUrl && (
            <div className="w-full">
              <img
                src={notice.imageUrl}
                alt={notice.title}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between p-4 pt-3">
            <div className="flex gap-4 text-2xl">
              <button>🤍</button>
              <button>📤</button>
            </div>
            <button className="text-2xl">🔖</button>
          </div>

          {/* 좋아요 */}
          <div className="px-4 pb-1 text-sm font-semibold">
            {notice.likes}명이 좋아합니다
          </div>

          {/* 제목 & 내용 */}
          <div className="px-4 pb-2 text-sm">
            <span className="mr-2 font-semibold">{notice.author}</span>
            {notice.title}
          </div>
          <div className="px-4 pb-4 text-sm text-gray-800">
            {notice.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;

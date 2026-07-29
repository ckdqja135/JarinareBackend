/**
 * @role: widgets — 게시글 알림 카드 (팔로우 최다 보유자 / 팔로잉 사용자)
 * @rule: 렌더링만 담당, 상태·로직 포함 금지
 */
import { elapsedTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';

interface BoardPostNotificationProps {
  posterName: string;
  createdAt: number;
  isRead: boolean;
  type: 'topFollower' | 'followPost';
  postDocId?: string | null;
  onClick: () => void;
  onNavigate?: () => void;
}

const BoardPostNotification = ({
  posterName,
  createdAt,
  isRead,
  type,
  postDocId,
  onClick,
  onNavigate,
}: BoardPostNotificationProps) => {
  const isTop = type === 'topFollower';

  return (
    <div
      onClick={onClick}
      className={`rounded-sm px-4 py-3 ${isRead ? 'bg-gray-100' : 'bg-white'}`}
      style={{
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.05), 0 -1px 3px rgba(0,0,0,0.05), 1px 0 3px rgba(0,0,0,0.05), -1px 0 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            isTop ? 'bg-yellow-100 text-yellow-600' : 'bg-blue/10 text-blue'
          }`}
        >
          {isTop ? '인기 게시글' : '팔로잉 새 글'}
        </span>
        <span className="text-xs text-darkGray">{elapsedTime(createdAt)}</span>
      </div>
      <div className="flex items-start gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: getProfileColor(posterName) }}
        >
          {posterName.charAt(0)}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="text-tiny font-bold text-gray-800">
            {isTop ? (
              <>
                가장 많은 팔로우를 보유한{' '}
                <span className="text-blue">{posterName}</span>님이 글을
                썼습니다. 확인해보세요!
              </>
            ) : (
              <>
                팔로우한 <span className="text-blue">{posterName}</span>님의
                최신 글을 확인해보세요!
              </>
            )}
          </p>
          {isTop && postDocId && onNavigate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              className="w-fit rounded px-2 py-0.5 text-xs font-bold text-blue underline"
            >
              보러가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardPostNotification;

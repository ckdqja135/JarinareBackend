/**
 * @role: widgets — 팔로우 알림 카드
 * @rule: 렌더링만 담당, 상태·로직 포함 금지
 */
import { elapsedTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';

interface FollowNotificationProps {
  followerName: string;
  createdAt: number;
  isRead: boolean;
  onClick: () => void;
}

const FollowNotification = ({
  followerName,
  createdAt,
  isRead,
  onClick,
}: FollowNotificationProps) => {
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
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-600">
          팔로우
        </span>
        <span className="text-xs text-darkGray">{elapsedTime(createdAt)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: getProfileColor(followerName) }}
        >
          {followerName.charAt(0)}
        </div>
        <p className="text-tiny font-bold text-gray-800">
          <span className="text-blue">{followerName}</span>님이 팔로우하기
          시작했습니다.
        </p>
      </div>
    </div>
  );
};

export default FollowNotification;

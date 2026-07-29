/**
 * @role: widgets — PC 상단 네비게이션
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { Link } from 'react-router-dom';
import notification from '@/assets/icons/notification.png';
import on_user from '@/assets/icons/on_user.png';
import useNotificationSidebarStore from '@/widgets/Notification/model/notificationSidebarStore';
import { useHasUnreadNotification } from '@/features/Notification/hooks/useHasUnreadNotification';

const PCTopNav = () => {
  const openNotificationSidebar = useNotificationSidebarStore(
    (state) => state.open,
  );
  const { hasUnread } = useHasUnreadNotification();

  return (
    <nav className="sticky top-0 z-50 h-14 w-full border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between px-10">
        {/* 브랜드 */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-blue">
          JARINARE
        </Link>

        {/* 아이콘 */}
        <div className="flex items-center gap-1">
          <button
            onClick={openNotificationSidebar}
            className="relative rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <img width={20} height={24} src={notification} />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 size-1.5 animate-ping rounded-full bg-blue" />
            )}
          </button>
          <Link
            to="/mypage"
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <img width={24} height={24} src={on_user} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PCTopNav;

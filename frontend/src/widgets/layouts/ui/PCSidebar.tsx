/**
 * @role: widgets — PC 사이드바 네비게이션
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { Link, useLocation } from 'react-router-dom';

/* 대시보드: 4분할 그리드 */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/* 내 승차권: 티켓 */
const TicketIcon = ({ active }: { active: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 1 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 1 1 0-4z" />
    <line x1="15" y1="4" x2="15" y2="20" strokeDasharray="2 2" />
  </svg>
);

/* 게시판: 말풍선 */
const BoardIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);

/* 승차권 반환: 박스 + 되돌리기 화살표 */
const ReturnIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <path d="M9 13l-3-3 3-3" />
    <path d="M6 10h6a3 3 0 0 1 0 6h-1" />
  </svg>
);

const SettingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SIDEBAR_ITEMS = [
  { label: '대시보드', path: '/', Icon: HomeIcon },
  { label: '내 승차권', path: '/ticketlist', Icon: TicketIcon },
  { label: '게시판', path: '/board', Icon: BoardIcon },
  { label: '승차권 반환', path: '/returnlist', Icon: ReturnIcon },
];

const PCSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[220px] shrink-0 flex-col border-r border-gray-200/50 bg-white/60 px-3 py-6 backdrop-blur-xl lg:flex">
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map(({ label, path, Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-lightBlue text-blue'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon active={isActive} />
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        to="/setting"
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 transition-colors hover:bg-gray-100"
      >
        <SettingIcon />
        <span className="text-sm font-semibold">설정</span>
      </Link>
    </aside>
  );
};

export default PCSidebar;

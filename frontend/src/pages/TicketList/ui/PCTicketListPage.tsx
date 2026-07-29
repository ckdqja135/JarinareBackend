/**
 * @role: pages — PC 내 승차권 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { usePCTicketListPage } from '../hooks/usePCTicketListPage';
import { useMiniTicket } from '@/widgets/TicketList/hooks/useMiniTicket';
import PCTicketItem from './PCTicketItem';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const USAGE_GUIDE = [
  { title: '출발역·도착역 및 날짜, 인원을 선택한 후 열차를 검색하세요.' },
  { title: '원하는 열차와 좌석을 선택하면 예매가 완료됩니다.' },
  { title: '탑승 전 승차권 반환 또는 좌석 변경이 가능합니다.' },
];

const FAQ = [
  {
    q: '예매 취소는 어떻게 하나요?',
    a: '내 승차권에서 해당 티켓의 상세보기를 눌러 반환 신청을 할 수 있습니다.',
  },
  {
    q: '좌석 변경이 가능한가요?',
    a: '출발 전이라면 상세보기에서 좌석 변경 신청이 가능합니다.',
  },
];

const PCTicketListPage = () => {
  const { isEmpty, isLoggedIn, handleSeatChange } = usePCTicketListPage();
  const navigate = useNavigate();
  const { items } = useMiniTicket();

  useKakaoLoader({
    appkey: import.meta.env.VITE_APP_KAKAO_JS_KEY as string,
  });

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
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">내 승차권</h1>
              {isEmpty && (
                <p className="mt-1 text-sm text-gray-400">
                  아직 예매한 승차권이 없어요
                </p>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {/* 카드 1: 승차권 목록 */}
              {!isLoggedIn ? (
                <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-white shadow-sm">
                  <LoginRequiredBlock
                    description="로그인 후 내 승차권을 확인할 수 있어요"
                    onLogin={() => navigate('/auth/login')}
                    size="md"
                  />
                </div>
              ) : isEmpty ? (
                <div className="min-h-[420px] rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center justify-center py-16">
                    {/* 가방 + 플러스 아이콘 */}
                    <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-lightBlue">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        <rect x="3" y="7" width="18" height="14" rx="2" />
                        <line x1="12" y1="11" x2="12" y2="17" strokeWidth="2" />
                        <line x1="9" y1="14" x2="15" y2="14" strokeWidth="2" />
                      </svg>
                    </div>
                    <p className="text-lg font-black text-gray-800">
                      아직 예매한 승차권이 없어요
                    </p>
                    <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-gray-400">
                      다가오는 여행 계획이 있으신가요?
                      <br />
                      빠르고 편안한 JARINARE 고속철도로 여행을 시작해보세요
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-6 flex items-center gap-2 rounded-lg bg-blue px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-blue/90"
                    >
                      승차권 예매하기
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item, idx) => (
                    <PCTicketItem
                      key={idx}
                      groups={item.groups}
                      ticket={item.ticket}
                      trainTypeName={item.trainTypeName}
                      startLabel={item.startLabel}
                      endLabel={item.endLabel}
                      startAmPm={item.startAmPm}
                      endAmPm={item.endAmPm}
                      dotDate={item.dotDate}
                      koreanDate={item.koreanDate}
                      ticketNo={item.ticketNo}
                      onSeatChange={handleSeatChange}
                    />
                  ))}
                </div>
              )}

              {/* 카드 2 + 카드 3: 수평 나열 */}
              <div className="grid grid-cols-2 gap-6">
                {/* 카드 2: 이용안내 */}
                <div className="max-h-[280px] overflow-y-auto rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lightBlue">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line
                          x1="12"
                          y1="16"
                          x2="12.01"
                          y2="16"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">
                      이용안내
                    </h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    {USAGE_GUIDE.map(({ title }) => (
                      <div key={title} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full border border-gray-300 bg-white" />
                        <span className="text-sm leading-relaxed text-gray-600">
                          {title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 카드 3: 자주묻는질문 */}
                <div className="max-h-[280px] overflow-y-auto rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lightBlue">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3" />
                        <line
                          x1="12"
                          y1="17"
                          x2="12.01"
                          y2="17"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                    <h2 className="flex-1 text-lg font-bold text-gray-800">
                      자주 묻는 질문
                    </h2>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {FAQ.map(({ q, a }) => (
                      <div key={q} className="py-3">
                        <p className="text-sm font-bold text-gray-800">
                          Q. {q}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          A. {a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCTicketListPage;

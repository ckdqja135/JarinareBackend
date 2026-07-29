/**
 * @role: pages — PC 승차권 반환 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import MiniTicket from '@/widgets/TicketReturn/ui/MiniTicket';
import Modal from '@/widgets/TicketReturn/ui/Modal';
import { usePCTicketReturnPage } from '../hooks/usePCTicketReturnPage';
import { useNavigate } from 'react-router-dom';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const PCTicketReturnPage = () => {
  const {
    handleReturnPC,
    handleNavigateHome,
    isShow,
    modalType,
    isEmpty,
    isLoggedIn,
  } = usePCTicketReturnPage();
  const navigate = useNavigate();

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
            {/* 파란 배경 제목 카드 */}
            <div className="mb-6 overflow-hidden rounded-2xl bg-blue px-8 py-10 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-white">승차권 반환</h1>
                <p className="text-sm text-white/70">
                  예매한 승차권을 확인하고 반환할 수 있어요
                </p>
              </div>
            </div>

            {/* 승차권 목록 */}
            {!isLoggedIn ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-white shadow-sm">
                <LoginRequiredBlock
                  description="로그인 후 승차권 반환을 이용할 수 있어요"
                  onLogin={() => navigate('/auth/login')}
                  size="md"
                />
              </div>
            ) : isEmpty ? (
              <div className="min-h-[420px] rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-16">
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
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <path d="M9 13l-3-3 3-3" />
                      <path d="M6 10h6a3 3 0 0 1 0 6h-1" />
                    </svg>
                  </div>
                  <p className="text-lg font-black text-gray-800">
                    반환할 승차권이 없어요
                  </p>
                  <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-gray-400">
                    예매한 승차권이 없거나 이미 모두 반환되었어요.
                    <br />
                    새로운 승차권을 예매하고 싶으시다면 아래 버튼을 눌러주세요
                  </p>
                  <button
                    onClick={handleNavigateHome}
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
              <div className="flex flex-col gap-4">
                <MiniTicket onReturnPC={handleReturnPC} />
              </div>
            )}
          </div>
        </main>
      </div>

      {isShow && modalType === 'ReturnModal' && <Modal />}
    </div>
  );
};

export default PCTicketReturnPage;

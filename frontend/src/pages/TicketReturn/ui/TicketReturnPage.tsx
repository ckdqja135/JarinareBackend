/**
 * @role: pages — 승차권 반환 페이지
 * @rule: PC/모바일 분기만 담당, 비즈니스 로직 포함 금지
 */
import { useEffect } from 'react';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import MiniTicket from '@/widgets/TicketReturn/ui/MiniTicket';
import PCTicketReturnPage from './PCTicketReturnPage';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { usePCTicketReturnPage } from '../hooks/usePCTicketReturnPage';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const TicketReturnPage = () => {
  const { isLoggedIn, handleLoginNavigate } = usePCTicketReturnPage();

  useEffect(() => {
    clearAllSeatsCache();
    prefetchAllSeats();
  }, []);

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCTicketReturnPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton />
        <span className="mt-5 w-full text-lg font-bold">승차권 반환</span>
        {!isLoggedIn ? (
          <div className="mt-12">
            <LoginRequiredBlock
              description="로그인 후 승차권 반환을 이용할 수 있어요"
              onLogin={handleLoginNavigate}
              size="md"
            />
          </div>
        ) : (
          <div className="mt-5 flex w-full flex-col gap-y-5 pb-[100px]">
            <MiniTicket />
          </div>
        )}
      </div>
    </>
  );
};

export default TicketReturnPage;

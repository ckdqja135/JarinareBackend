/**
 * @role: pages — 이벤트 목록 페이지 (PC + 모바일)
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { Event } from '@/widgets/Board/ui/Event';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WriteButton from '@/shared/ui/WriteButton';
import PCEventListPage from './PCEventListPage';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const EventListPage = () => {
  const navigate = useNavigate();
  const { markSeen } = useBoardSeen();
  const { user } = useCurrentUser();
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    markSeen('event');
  }, []);

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCEventListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center bg-white px-[27px] py-4 shadow-sm">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="ml-4 text-lg font-bold">이벤트</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-[80px]">
          <Event />
        </div>

        {isAdmin && <WriteButton onClick={() => navigate('/board/event')} />}
      </div>
    </>
  );
};

export default EventListPage;

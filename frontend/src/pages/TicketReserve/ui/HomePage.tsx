import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import { useResetTrainType } from '../hooks/homeHook';
import { useRef, useState, useEffect } from 'react';
import {
  prefetchAllSeats,
  clearAllSeatsCache,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { Static } from '@/widgets/TicketReserve/ui/Static';
import { Reserve } from '@/widgets/TicketReserve/ui/Reserve';
import { Ticket } from '@/widgets/TicketReserve/ui/Ticket';
import RecommendDestination from '@/widgets/TicketReserve/ui/RecommendDestination';
import notification from '@/assets/icons/notification.png';
import setting from '@/assets/icons/setting.png';
import { Link } from 'react-router-dom';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';
import PCHomePage from './PCHomePage';

const HomePage = () => {
  const { isShow, modalType } = useModalStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { response } = useChangeResponse();
  const { acceptResponse, refuseResponse } = useIsAcceptResponse();
  const { departureNotifs } = useReadStartTime();

  const isExistNotification =
    departureNotifs.length > 0 ||
    response.length > 0 ||
    (acceptResponse?.length ?? 0) > 0 ||
    (refuseResponse?.length ?? 0) > 0;

  const isReadNotification =
    departureNotifs.some((n) => !n.isRead) ||
    response.some((r) => !r.isRead) ||
    (acceptResponse?.some((r) => !r.isRead) ?? false) ||
    (refuseResponse?.some((r) => !r.isRead) ?? false);

  useResetTrainType();

  useEffect(() => {
    clearAllSeatsCache();
    prefetchAllSeats();
  }, []);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  };

  const onPageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setIsScrolledBottom(isBottom);
  };

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCHomePage />
      </div>

      {/* 모바일 버전 */}
      <div
        className={`flex h-screen w-full flex-col bg-gray-100 lg:hidden ${isShow === true ? 'overflow-hidden' : ''}`}
      >
        {/* 상단 헤더 */}
        <div className="flex w-full items-center justify-between px-[28px] pb-[4px] pt-[20px]">
          <span className="text-lg font-black tracking-widest text-blue">
            JARINARE
          </span>
          <div className="flex items-center gap-3">
            <Link to={'/reserve/notification'} className="relative">
              <img width={19} height={24} src={notification} />
              {isReadNotification && isExistNotification ? (
                <span className="absolute bottom-6 left-4 size-1.5 animate-ping rounded-full bg-blue" />
              ) : null}
            </Link>
            <Link to={'/setting'}>
              <img width={22} height={22} src={setting} />
            </Link>
          </div>
        </div>
        <div className="mt-2 w-full border-b border-gray-200" />

        {/* 인디케이터 — 상단 */}
        {!isScrolledBottom && (
          <div className="flex w-full items-center justify-center gap-2 py-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-5 bg-blue' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* 슬라이드 컨테이너 */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex flex-1 overflow-y-hidden overflow-x-scroll"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
        >
          {/* 예매 페이지 */}
          <div
            onScroll={onPageScroll}
            className="flex h-full w-full shrink-0 flex-col items-center overflow-y-auto px-[28px] pb-[100px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Reserve />
            <Ticket />
          </div>

          {/* 추천 여행지 페이지 */}
          <div
            onScroll={onPageScroll}
            className="flex h-full w-full shrink-0 flex-col overflow-y-auto px-[28px] pb-[100px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <RecommendDestination />
          </div>

          {/* 통계 페이지 */}
          <div
            onScroll={onPageScroll}
            className="flex h-full w-full shrink-0 flex-col items-center overflow-y-auto px-[28px] pb-[100px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Static />
          </div>
        </div>

        {/* 인디케이터 — 하단 */}
        {isScrolledBottom && (
          <div className="absolute bottom-[100px] flex w-full items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-5 bg-blue' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {isShow == false || modalType == undefined ? null : <Modal />}
      </div>
    </>
  );
};

export default HomePage;

/**
 * @role: pages — 열차 조회 페이지 진입점
 * @rule: PC/모바일 분기 및 공통 초기화만 담당
 */
import { useEffect } from 'react';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import TrainCheckMenu from '@/widgets/TicketReserve/ui/TrainCheckMenu';
import TrainCheckTitle from '@/widgets/TicketReserve/ui/TrainCheckTitle';
import TrainList from '@/widgets/TicketReserve/ui/TrainList';
import {
  prefetchAllSeats,
  clearAllSeatsCache,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import PCTrainCheckPage from './PCTrainCheckPage';

const TrainCheckPage = () => {
  const { isShow, modalType } = useModalStore();
  const { startDayForView } = trainDataStore();

  // 모달 초기 혼잡도 표시 오류 방지를 위해 좌석 데이터 사전 로딩
  useEffect(() => {
    clearAllSeatsCache();
    prefetchAllSeats();
  }, []);

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCTrainCheckPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col items-center overflow-y-hidden bg-gray-100 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton title="열차 조회" />
        <div className="mt-4 w-full">
          <span className="text-xs text-gray-400">출발 날짜</span>
          <p className="text-lg font-bold text-gray-900">{startDayForView}</p>
        </div>
        <TrainCheckTitle />
        <TrainCheckMenu />
        <TrainList />
      </div>

      {/* PC/모바일 공통 모달 */}
      {isShow && modalType != undefined && <Modal />}
    </>
  );
};

export default TrainCheckPage;

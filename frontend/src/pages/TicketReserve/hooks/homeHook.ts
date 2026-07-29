import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useResetTrainType = () => {
  const location = useLocation();
  const {
    setTrainTypeForView,
    setTrainType,
    setStartTime,
    setStartTimeForView,
    setSelectAdult,
    setSelectKid,
  } = trainDataStore();
  const { refetch } = trainQueryData();

  useEffect(() => {
    if (location.pathname === '/') {
      // 홈으로 오면 기차종류, 시간대 초기화
      setTrainTypeForView('');
      setStartTimeForView('05');
      setTrainType('');
      setStartTime('');

      // 뒤로가기를 예매 페이지로 갔을 시 좌석 예매 이중 방지
      setSelectAdult(0);
      setSelectKid(0);

      refetch();
    }
  }, []);
};

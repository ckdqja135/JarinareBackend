/**
 * @role: features — 승차권 반환 처리
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { useCreateOrder } from '@/features/Point/hooks/useCreateOrder';
import { backendClient } from '@/shared/api/backendClient';

export const useTicketReturn = () => {
  const { seatsReturnData } = seatsReturnDataStore();
  const { createOrder } = useCreateOrder();

  // 선택한 승차권 제거
  const handleDeleteSeats = async () => {
    try {
      await Promise.all(
        seatsReturnData
          .filter((item) => item.reservationId)
          .map((item) =>
            backendClient.delete(`/api/seats/reservations/${item.reservationId}`),
          ),
      );

      // 반환 내역 기록 (useCreateOrder는 Firestore 유지)
      if (seatsReturnData.length > 0) {
        const first = seatsReturnData[0];
        await createOrder({
          startStationForView: first.startStationForView,
          endStationForView: first.endStationForView,
          startDay: first.startDay,
          startDayForView: first.startDayForView,
          trainType: first.trainType,
          selectAdult: first.selectAdult,
          selectKid: first.selectKid,
          seatCount: seatsReturnData.length,
          finalPrice: first.selectPay,
          paymentMethod: '반환',
          selectedCard: null,
          isReturn: true,
        });
      }

      clearAllSeatsCache();
      prefetchAllSeats();
    } catch (e) {
      console.log(e);
    }
  };
  return { handleDeleteSeats };
};

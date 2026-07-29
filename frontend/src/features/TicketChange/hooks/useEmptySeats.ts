// @role: features — 빈 좌석 이동 (내 좌석 → 빈 좌석 위치)
// @rule: api/ 호출만 담당, Firestore 직접 호출 금지
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';

export const useEmptySeats = () => {
  const location = useLocation();
  const { trainNo } = trainDataStore();
  const user = auth.currentUser;
  const mySeats: SeatType[] = location.state;

  const emptySeatsChange = async (emptySeatsTarget: string[]) => {
    if (!user) return;
    if (emptySeatsTarget.length !== mySeats.length) return;

    try {
      // 기존 좌석 취소
      await Promise.all(
        mySeats.map((seat) =>
          backendClient.delete(`/api/seats/reservations/${seat.reservationId}`),
        ),
      );

      // 새 위치에 좌석 생성
      await Promise.all(
        mySeats.map((seat, i) =>
          backendClient.post('/api/seats/reservations', {
            seatId: emptySeatsTarget[i],
            trainNoId: trainNo,
            startDay: seat.startDay,
            startTime: seat.startTime,
            endTime: seat.endTime,
            trainType: seat.trainType,
            startDayForView: seat.startDayForView,
            startStationForView: seat.startStationForView,
            endStationForView: seat.endStationForView,
            selectKid: seat.selectKid,
            selectAdult: seat.selectAdult,
            selectPay: seat.selectPay,
            docId: seat.id,
          }),
        ),
      );
    } catch (e) {
      console.log(e);
    }
  };

  return { emptySeatsChange };
};

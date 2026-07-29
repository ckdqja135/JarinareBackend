import Seat from './Seat';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import { auth } from '@/shared/firebase/firebase';
import { reserveConstants } from '@/widgets/TicketReserve/constants/ReserveConstants';
import { seatIdsStore } from '@/features/TicketChange/models/seatIdsStore';
import { useSeatsSelect } from '@/features/TicketChange/hooks/useSeatsSelect';
import { useMixSeats } from '@/features/TicketChange/hooks/useMixSeats';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { useGetSeatsState } from '@/features/TicketChange/hooks/useGetSeatsState';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const SeatChangeList = () => {
  const { seatsRows } = reserveConstants();
  const { seatsState } = seatsStateStore();
  const { seatsChangeMixTargetOrAllTarget } = useMixSeats();
  const { handleSeatsSelect, locks, isLocksLoaded } = useSeatsSelect();
  const { setId } = seatIdsStore();
  const { seatsChangeInfo } = useGetSeatsState();
  const { trainNo } = trainDataStore();

  const user = auth.currentUser;

  if (!user) return;

  if (!seatsState)
    return (
      <div className="mt-[15px] h-[420px]">
        <LoadingScreen />
      </div>
    );

  return (
    <div className="mt-[15px] h-[420px] w-full rounded-lg bg-lightestGray px-5">
      <div className="flex justify-between text-lg font-bold text-black">
        <div className="flex gap-x-2">
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            A
          </span>
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            B
          </span>
        </div>
        <div className="flex gap-x-2">
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            C
          </span>
          <span className="flex h-[40px] w-[40px] items-center justify-center">
            D
          </span>
        </div>
      </div>
      {seatsRows.map((row) => {
        // 왼쪽 좌석 A1~A6, B1~B6
        const leftSeats = [`A${row}`, `B${row}`];
        // 오른쪽 좌석 C1~C6, D1~D6
        const rightSeats = [`C${row}`, `D${row}`];

        return (
          <div key={row} className="mb-6 flex items-center justify-between">
            <div className="flex w-[100px] gap-2">
              {leftSeats.map((id) => {
                // 좌석 번호에 맞게 ture(선택)/false(미선택) 반영
                const seatState = seatsState[id];

                // 예매된 본인 좌석
                const isMine = seatsChangeInfo.some(
                  (item) => item.seatId === id && item.userId === user.uid,
                );
                // 예매된 본인 이외의 좌석
                const isOther = seatsChangeInfo.some(
                  (item) => item.seatId === id && item.userId !== user.uid,
                );

                // 변경할 좌석
                const isMineByChangeLittleTarget =
                  seatsChangeMixTargetOrAllTarget.some(
                    (seatId) => seatId === id,
                  );

                // 실시간 상대방 좌석 잠금
                const isLocked = Object.entries(locks).some(
                  (item) =>
                    item[0] === id &&
                    item[1].userId !== user.uid &&
                    item[1].trainNo === trainNo,
                );

                return (
                  <Seat
                    // 좌석을 선택한 경우와 변경할 좌석을 선택한 경우가 같을 때
                    isChangeTarget={isMineByChangeLittleTarget}
                    key={id}
                    onClick={async () => {
                      setId(id);
                      if (isLocksLoaded) {
                        await handleSeatsSelect(id);
                      }
                    }}
                    borderColor="lightGray"
                    bgColor={
                      isMine
                        ? 'green'
                        : isOther || isLocked
                          ? 'lightGray'
                          : seatState
                            ? 'blue'
                            : 'lightesGray'
                    }
                  />
                );
              })}
            </div>
            <div className="w-[40px] text-center text-lg font-bold">{row}</div>
            <div className="flex w-[100px] justify-end gap-2">
              {rightSeats.map((id) => {
                const seatState = seatsState[id];

                const isMine = seatsChangeInfo.some(
                  (item) => item.seatId === id && item.userId === user.uid,
                );
                const isOther = seatsChangeInfo.some(
                  (item) => item.seatId === id && item.userId !== user.uid,
                );

                const isMineByChangeLittleTarget =
                  seatsChangeMixTargetOrAllTarget.some(
                    (seatId) => seatId === id,
                  );

                // 실시간 상대방 좌석 잠금
                const isLocked = Object.entries(locks).some(
                  (item) =>
                    item[0] === id &&
                    item[1].userId !== user.uid &&
                    item[1].trainNo === trainNo,
                );

                return (
                  <Seat
                    isChangeTarget={isMineByChangeLittleTarget}
                    key={id}
                    onClick={async () => {
                      setId(id);
                      if (isLocksLoaded) {
                        await handleSeatsSelect(id);
                      }
                    }}
                    borderColor="lightGray"
                    bgColor={
                      isMine
                        ? 'green'
                        : isOther || isLocked
                          ? 'lightGray'
                          : seatState
                            ? 'blue'
                            : 'lightesGray'
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeatChangeList;

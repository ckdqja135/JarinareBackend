/**
 * @role: pages — 좌석 상세 페이지
 * @rule: UI 조합과 탭 전환 상태만 담당, 비즈니스 로직 포함 금지
 */
import { useNaviation } from '../hooks/TicketChangeHook';
import { useTicketLocation } from '../hooks/useTicketLocation';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useReset } from '../hooks/useReset';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { memo, useState } from 'react';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { useTicketDetail } from '@/features/TicketChange/hooks/useTicketDetail';
import TicketCard from '@/widgets/TicketChange/ui/TicketCard';
import RouteCard from '@/widgets/TicketChange/ui/RouteCard';

const TicketSeatChangePage = memo(() => {
  const { navigate } = useNaviation();
  const { location } = useTicketLocation();
  const seats: SeatType[] = location.state.groups;

  const [showRoute, setShowRoute] = useState(false);

  useKakaoLoader({
    appkey: import.meta.env.VITE_APP_KAKAO_JS_KEY as string,
  });

  useReset();

  if (!seats) return;

  const {
    s,
    filtred,
    segmentStations,
    qrValue,
    startHH,
    startMM,
    endHH,
    endMM,
    dur,
    durText,
    departure,
    arrival,
  } = useTicketDetail(seats);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 px-6 pb-8">
      <div className="w-full">
        <BackWardPageButton title="좌석 상세" />
      </div>

      {/* 전환 버튼 */}
      <div className="mb-3 mt-3 flex w-full rounded-2xl bg-white p-1 shadow-sm">
        <button
          onClick={() => setShowRoute(false)}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
            !showRoute ? 'bg-blue text-white shadow-sm' : 'text-gray-400'
          }`}
        >
          티켓
        </button>
        <button
          onClick={() => setShowRoute(true)}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
            showRoute ? 'bg-blue text-white shadow-sm' : 'text-gray-400'
          }`}
        >
          구간
        </button>
      </div>

      {/* 카드 교차 영역 */}
      <div className="relative w-full">
        {/* 티켓 카드 */}
        <div
          className="w-full transition-opacity duration-[400ms]"
          style={{
            opacity: showRoute ? 0 : 1,
            pointerEvents: showRoute ? 'none' : 'auto',
          }}
        >
          <TicketCard
            s={s}
            filtred={filtred}
            qrValue={qrValue}
            startHH={startHH}
            startMM={startMM}
            endHH={endHH}
            endMM={endMM}
            durText={durText}
          />
        </div>

        {/* 구간 카드 */}
        <div
          className="absolute inset-0 transition-opacity duration-[400ms]"
          style={{
            opacity: showRoute ? 1 : 0,
            pointerEvents: showRoute ? 'auto' : 'none',
          }}
        >
          <RouteCard
            s={s}
            segmentStations={segmentStations}
            departure={departure}
            arrival={arrival}
            dur={dur}
            durText={durText}
          />
        </div>
      </div>

      {/* 좌석 변경 버튼 */}
      <div className="mt-3 w-full">
        <button
          onClick={() =>
            navigate('/seatchange', {
              state: Array.isArray(seats) ? seats : [seats],
            })
          }
          className="w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white active:brightness-95"
        >
          좌석 변경
        </button>
      </div>
    </div>
  );
});

TicketSeatChangePage.displayName = 'TicketSeatChangePage';

export default TicketSeatChangePage;

/**
 * @role: pages — PC 구간 티켓 아이템
 * @rule: 렌더링·조합만 담당, 로직은 usePCRouteTicketItem에 위임
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { usePCRouteTicketItem } from '../hooks/usePCRouteTicketItem';
import RouteCard from '@/widgets/TicketChange/ui/RouteCard';

interface PCRouteTicketItemProps {
  groups: SeatType[];
}

const PCRouteTicketItem = ({ groups }: PCRouteTicketItemProps) => {
  const { s, segmentStations, departure, arrival, dur, durText } =
    usePCRouteTicketItem(groups);

  return (
    <RouteCard
      s={s}
      segmentStations={segmentStations}
      departure={departure}
      arrival={arrival}
      dur={dur}
      durText={durText}
    />
  );
};

export default PCRouteTicketItem;

import { useCheckStationStore } from '../model/PlaceInputStroe';
import useModalStore from '@/widgets/model/ReserveStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import {
  getReachableStations,
  normalizeStation,
} from '@/shared/lib/trainRoutes';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';

// 출발역(StartStationList)과 달리 출발역 기준 동일 노선의 역만 필터링하여 표시
const EndStationList = () => {
  const { isValue } = useCheckStationStore();
  const { closeModal } = useModalStore();
  const { setEndStation, setEndStationForView, startStationForView } =
    trainDataStore();
  const { stations, isLoading } = trainQueryData();

  const reachable = startStationForView
    ? getReachableStations(normalizeStation(startStationForView))
    : null;

  const filtered = stations.filter((station) => {
    if (!station || !station.nodename) return false;
    if (
      reachable &&
      reachable.length > 0 &&
      !reachable.includes(normalizeStation(station.nodename))
    )
      return false;
    if (isValue && !station.nodename.includes(isValue)) return false;
    return true;
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="w-full overflow-y-scroll px-[28px] pt-2">
      <span className="mb-2 block px-2 text-xs font-semibold text-gray-400">
        전체역
      </span>
      {filtered.map((station) => {
        if (!station || !station.nodename) return null;
        return (
          <div
            key={station.nodeid}
            onClick={() => {
              closeModal('EndPlaceModal');
              setEndStation(station.nodeid);
              setEndStationForView(station.nodename);
            }}
            className="mb-2 flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm transition-all active:brightness-75"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lightBlue text-xs font-bold text-blue">
              {station.nodename[0]}
            </div>
            <span className="text-sm font-semibold text-darkGray">
              {station.nodename}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default EndStationList;

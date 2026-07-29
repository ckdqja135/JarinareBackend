import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import { PlaceModalProp } from '../types/ReserveType';

const EndRecommendStationList = ({ modalType }: PlaceModalProp) => {
  const { closeModal } = useModalStore();
  const { recommendStationArray } = reserveConstants();
  const { setEndStation, setEndStationForView } = trainDataStore();
  return (
    <div className="mt-[15px] w-full">
      <span className="text-xs font-semibold text-gray-400">추천역</span>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {recommendStationArray.map(({ text, id }, idx) => (
          <div
            onClick={() => {
              closeModal(modalType!);
              setEndStation(id);
              setEndStationForView(text);
            }}
            key={idx}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm transition-all active:brightness-95"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-blue">
              {text[0]}
            </div>
            <span className="text-sm font-semibold text-darkGray">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EndRecommendStationList;

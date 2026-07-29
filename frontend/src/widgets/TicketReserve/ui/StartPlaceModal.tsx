import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';
import { usePlaceInputStore } from '../model/PlaceInputStroe';
import PlaceInput from './PlaceInput';
import PlaceTitle from './PlaceTitle';
import StartRecommendStationList from './StartRecommendStation';
import StartStationList from './StartStationList';
import useModalStore from '@/widgets/model/ReserveStore';

const StartPlaceModal = () => {
  const { isShow } = usePlaceInputStore();
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-gray-100 lg:justify-center lg:bg-black/40">
      <div className="flex h-full w-full flex-col items-center bg-gray-100 lg:h-[560px] lg:w-[480px] lg:overflow-hidden lg:rounded-2xl">
        <div className="w-full pl-[28px] pr-[27px]">
          <BackWardModalButton
            closeModal={() => closeModal('StartPlaceModal')}
          />
          <PlaceTitle text="출발지를 선택해주세요" />
          <PlaceInput placeholder="출발역 선택" />
          {isShow ? null : (
            <StartRecommendStationList modalType={'StartPlaceModal'} />
          )}
          {isShow ? null : (
            <div className="mt-5 w-full border border-lightGray" />
          )}
        </div>
        <StartStationList />
      </div>
    </div>
  );
};

export default StartPlaceModal;

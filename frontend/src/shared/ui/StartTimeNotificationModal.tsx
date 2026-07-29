import cross from '@/assets/icons/cross.png';
import detail from '@/assets/icons/detail.png';
import globalModalStore from '../models/globalModalStore';
import { useHideNotification } from '../hooks/useHideNotification';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useNavigation } from '../hooks/useNavigate';
import { TimeDifferenceDataType } from '../types/timeDifferenceData';

export const StartTimeNotificationModal = ({
  timeDifferenceData,
}: TimeDifferenceDataType) => {
  const { closeModal } = globalModalStore();
  const { isHide, isFade, isHover, setIsHover, setIsHide } =
    useHideNotification();
  const { navigate } = useNavigation();
  const {
    setStartDay,
    setSelectStartTime,
    setSelectTrainType,
    setTrainNo,
    setSeatsId,
  } = trainDataStore();

  return (
    <div
      className={`${isFade ? 'animate-fadein' : 'animate-fadeout'} flex items-center justify-center`}
    >
      {isHide ? (
        <div
          onMouseOver={() => setIsHover(true)}
          onMouseOut={() => setIsHover(false)}
          className="relative mt-5 flex h-[50px] w-[300px] cursor-pointer rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)]"
        >
          <div
            onClick={() => {
              setIsHide(false);
              closeModal('GlobalModal');
              setTimeout(() => closeModal('GlobalModal'), 2000);
            }}
            className={` ${isHover ? 'opacity-100' : 'opacity-0'} absolute -left-1 bottom-8 flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_0_5px_rgba(0,0,0,0.25)] transition-opacity duration-300 ease-out`}
          >
            <img src={cross} width={15} height={15} />
          </div>
          <div
            onClick={() => {
              setIsHide(false);
              closeModal('GlobalModal');
              navigate('/ticket/seatchange', {
                state: { groups: timeDifferenceData },
              });
              setStartDay(timeDifferenceData[0]?.startDay);
              setSelectStartTime(timeDifferenceData[0]?.startTime);
              setSelectTrainType(timeDifferenceData[0]?.trainType);
              setTrainNo(timeDifferenceData[0]?.trainNoId);
              setSeatsId(timeDifferenceData?.map((item) => item.seatId));
            }}
            className="flex w-full items-center justify-between px-5"
          >
            <span className="text-base font-bold text-blue">
              곧 기차가 출발합니다.
            </span>
            <img src={detail} width={10} height={10} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

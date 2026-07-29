import useModalStore from '@/widgets/model/ReserveStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';

import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import SkeletonScreen from '@/widgets/layouts/ui/SkeletonScreen';
import TrainTimeChocieButton from './TrainTimeChoiceButton';
import {
  formatTime,
  formatTimeView,
  formatTodayDate,
  isToday,
} from '@/shared/lib/formatDate';

const TrainList = () => {
  const { openModal } = useModalStore();
  const { isFetching, trainTime } = trainQueryData();
  const {
    startDay,
    startTime,
    kid,
    adult,
    setSelectStartTime,
    setSelectEndTime,
    setSelectTrainType,
    setSelectKid,
    setSelectAdult,
    setSelectPay,
  } = trainDataStore();
  const today = isToday();

  const filtered = trainTime.filter((time) => {
    // 오늘 날짜가 기차 출발 날짜와 동일하면 현재 시간 이후의 기차 시간 목록만 보여주지만,
    // 오늘 날짜에서 선택한 시간이 현재 시간 이후면 선택한 시간 이후의 기차 시간 목록만 보여준다.
    if (startDay === today) {
      if (startTime > formatTime()) {
        return (
          String(time.depplandtime).toString().substring(8, 12) >= startTime
        );
      }
      return time.depplandtime >= formatTodayDate();
    }
    // 그렇지 않으면 선택한 시간 이후의 기차 시간 목록만 보여줌.
    return String(time.depplandtime).toString().substring(8, 12) >= startTime;
  });

  if (isFetching)
    return (
      <div className="h-[100vh]">
        <SkeletonScreen />
      </div>
    );

  return (
    <div className="mt-5 flex w-full flex-col gap-y-3 overflow-y-auto pb-24">
      {filtered.length === 0 ? (
        <span className="flex justify-center text-tiny font-bold">
          조회된 열차 목록이 없어요.
        </span>
      ) : (
        filtered.map(
          (
            {
              depplandtime,
              arrplandtime,
              traingradename,
              adultcharge,
              trainno,
            },
            idx,
          ) => {
            const depH = Number(String(depplandtime).substring(8, 10));
            const depM = Number(String(depplandtime).substring(10, 12));
            const arrH = Number(String(arrplandtime).substring(8, 10));
            const arrM = Number(String(arrplandtime).substring(10, 12));
            let durationMin = (arrH * 60 + arrM) - (depH * 60 + depM);
            if (durationMin < 0) durationMin += 24 * 60;
            const durationText = durationMin >= 60
              ? `${Math.floor(durationMin / 60)}시간 ${durationMin % 60 > 0 ? `${durationMin % 60}분` : ''}`
              : `${durationMin}분`;

            return (
              <div
                key={idx}
                className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 shadow-sm ${
                  adultcharge === 0 ? 'bg-gray-100' : 'bg-white'
                }`}
              >
                {/* 왼쪽: 기차종류 → 시간대 → 요금 */}
                <div className="flex flex-col gap-y-1.5">
                  <span
                    className={`rounded-md self-start px-2 py-0.5 text-xs font-bold ${adultcharge === 0 ? 'bg-gray-200 text-gray-400' : 'bg-lightBlue text-blue'}`}
                  >
                    {traingradename}-{trainno}
                  </span>
                  <span
                    className={`text-lg font-bold ${adultcharge === 0 ? 'text-gray-400' : 'text-gray-900'}`}
                  >
                    {formatTimeView(String(depplandtime))}
                    <span className="mx-1.5 text-base font-normal text-gray-400">→</span>
                    {formatTimeView(String(arrplandtime))}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={adultcharge === 0 ? { color: '#EA433580' } : undefined}
                  >
                    {adultcharge === 0 ? (
                      <span>매진</span>
                    ) : (
                      <span className="text-gray-400">
                        {adultcharge.toLocaleString('ko-KR')}원
                      </span>
                    )}
                  </span>
                </div>

                {/* 오른쪽: 소요시간(위) + 선택버튼(아래) */}
                <div className="flex flex-col items-end justify-between gap-y-3">
                  <div className="flex flex-col items-end gap-y-0.5">
                    <span className="text-[10px] text-gray-400">소요시간</span>
                    <span className={`text-xs font-semibold ${adultcharge === 0 ? 'text-gray-300' : 'text-gray-800'}`}>
                      {durationText}
                    </span>
                  </div>
                  <TrainTimeChocieButton
                    disabled={adultcharge === 0}
                    text="선택"
                    onModalClick={() => {
                      openModal('ChoiceResultModal');
                      setSelectStartTime(depplandtime);
                      setSelectEndTime(arrplandtime);
                      setSelectTrainType(traingradename + '-' + trainno);
                      setSelectKid(kid);
                      setSelectAdult(adult);
                      setSelectPay(adultcharge);
                    }}
                  />
                </div>
              </div>
            );
          },
        )
      )}
    </div>
  );
};

export default TrainList;

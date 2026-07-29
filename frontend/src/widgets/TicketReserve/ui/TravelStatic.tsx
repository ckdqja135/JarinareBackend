import { AgeOrGenderStaticList } from './AgeOrGenderStaticList';
import { useTravelStatic } from '../hooks/useTravelStatic';

const AGES = ['10대', '20대', '30대', '40대', '50대', '60대+'];
const GENDERS = ['남자', '여자'];

type Props = { age: boolean };

export const TravelStatic = ({ age }: Props) => {
  const { stats, isLoading } = useTravelStatic();

  const top5 = stats.slice(0, 5);

  const now = new Date();
  const dateLabel = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')} 기준`;

  // 나이대별: 각 나이대에서 가장 많이 방문한 목적지 + 예약 수
  const ageRows = AGES.map((label) => {
    let topDest = '-';
    let topCount = 0;
    stats.forEach((s) => {
      const cnt = s.byAge[label] ?? 0;
      if (cnt > topCount) {
        topCount = cnt;
        topDest = s.destination;
      }
    });
    return { label, location: topDest, count: topCount };
  });

  // 성별별: 각 성별에서 가장 많이 방문한 목적지 + 예약 수
  const genderRows = GENDERS.map((label) => {
    let topDest = '-';
    let topCount = 0;
    stats.forEach((s) => {
      const cnt = s.byGender[label] ?? 0;
      if (cnt > topCount) {
        topCount = cnt;
        topDest = s.destination;
      }
    });
    return { label, location: topDest, count: topCount };
  });

  const rows = age ? genderRows : ageRows;
  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="flex w-[320px] flex-col items-center rounded-lg bg-white pb-5 pt-5 shadow-sm">
      {isLoading ? (
        <span className="text-sm text-mediumGray">불러오는 중...</span>
      ) : (
        <>
          <div className="mb-[20px] flex w-[280px] items-end justify-between">
            <span className="text-base font-bold">
              {age ? '성별' : '나이대별'} 인기 여행지
            </span>
            <span className="text-sm text-mediumGray">{dateLabel}</span>
          </div>

          {/* 1위 강조 */}
          {top5.length > 0 && (
            <div className="mb-[20px] flex h-[55px] w-[280px] items-center justify-between rounded-lg bg-white pl-[10px] pr-[10px]">
              <div className="flex items-center justify-center gap-x-2">
                <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-blue text-white">
                  1
                </span>
                <span className="flex text-base font-bold">
                  {top5[0].destination}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-base font-bold text-blue">
                  {top5[0].totalCount.toLocaleString('ko-KR')}명
                </span>
              </div>
            </div>
          )}

          {/* 나이대/성별 막대 목록 */}
          <div className="flex flex-col gap-y-3">
            {rows.map((item, key) => (
              <AgeOrGenderStaticList
                key={key}
                age={item.label}
                location={item.location}
                count={
                  item.count > 0
                    ? `${item.count.toLocaleString('ko-KR')}명`
                    : '-'
                }
                percent={Math.round((item.count / maxCount) * 100)}
              />
            ))}

            <div className="w-full border border-lightGray" />

            {/* TOP5 */}
            <span className="text-sm font-bold text-darkGray">
              전체 인기 여행지 TOP 5
            </span>

            {top5.length === 0 ? (
              <span className="text-sm text-mediumGray">
                데이터가 없습니다.
              </span>
            ) : (
              <div className="flex w-full items-center justify-between">
                {top5.map((item, i) => {
                  const bgColor =
                    i === 0 ? '#2563eb' : i === 1 ? '#E7F2FD' : '#e2e8f0';
                  const textColor =
                    i === 0 ? '#ffffff' : i === 1 ? '#2563eb' : '#94a3b8';
                  return (
                    <div key={i} className="flex flex-col items-center gap-y-1">
                      <div
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-sm font-bold"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-xs font-bold">
                        {item.destination}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

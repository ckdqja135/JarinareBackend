/**
 * @role: widgets/layouts — ui
 * @rule: 렌더링만 담당, PC 열차 카드 스켈레톤
 */

const PCSkeletonScreen = () => {
  const arr = Array.from({ length: 5 }, (_, i) => i);
  return (
    <div className="flex flex-col gap-3">
      {arr.map((idx) => (
        <div
          key={idx}
          className="flex animate-pulse rounded-xl border border-gray-100 bg-white"
        >
          {/* 시간 구간 */}
          <div className="flex flex-[9] flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 rounded-md bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-16 rounded bg-gray-200" />
                <div className="h-3 w-12 rounded bg-gray-100" />
              </div>
              <div className="flex flex-1 flex-col items-center gap-1">
                <div className="h-3 w-12 rounded bg-gray-100" />
                <div className="h-px w-full bg-gray-200" />
                <div className="h-3 w-10 rounded bg-gray-100" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-16 rounded bg-gray-200" />
                <div className="h-3 w-12 rounded bg-gray-100" />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-l border-dashed border-gray-200" />

          {/* 요금 구간 */}
          <div className="flex flex-[1] flex-col items-center justify-between gap-3 p-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-14 rounded bg-gray-100" />
              <div className="h-7 w-20 rounded bg-gray-200" />
              <div className="h-3 w-12 rounded bg-gray-100" />
            </div>
            <div className="h-7 w-full rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PCSkeletonScreen;

type AgeOrGenderStaticType = {
  age: string;
  location: string;
  count: string;
  percent: number; // 최대값 대비 비율 (0~100)
};

export const AgeOrGenderStaticList = ({
  age,
  location,
  count,
  percent,
}: AgeOrGenderStaticType) => {
  return (
    <div className="flex w-[280px] items-center justify-center rounded-lg pl-[10px] pr-[10px]">
      <div className="flex w-full items-center gap-x-2 text-sm">
        <span className="w-[36px] shrink-0 font-bold text-darkGray">{age}</span>
        <div className="relative flex h-[28px] flex-1 overflow-hidden rounded-xs bg-lightGray">
          <div
            className="h-full bg-blue transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-white">{location}</span>
            <span className="text-xs text-white/80">{count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeatCheckState = () => {
  return (
    <div className="mt-[10px] flex w-full justify-between px-[15px] text-tiny font-bold">
      <div className="flex items-center gap-x-[10px]">
        <div className="h-5 w-5 rounded-xs bg-blue" />
        <span>선택됨</span>
      </div>
      <div className="flex items-center gap-x-[10px]">
        <div className="h-5 w-5 rounded-xs bg-lightGray" />
        <span>이용 불가</span>
      </div>
      <div className="flex items-center gap-x-[10px]">
        <div className="h-5 w-5 rounded-xs border border-lightGray bg-white" />
        <span>이용 가능</span>
      </div>
    </div>
  );
};

export default SeatCheckState;

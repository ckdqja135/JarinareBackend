const SeatChangeState = () => {
  return (
    <div className="mt-[10px] flex w-full justify-between px-[15px] text-tiny font-bold">
      <div className="flex items-center gap-x-[10px]">
        <div className="h-5 w-5 rounded-xs bg-green" />
        <span>내 좌석</span>
      </div>
      <div className="flex items-center gap-x-[10px]">
        <div className="h-5 w-5 rounded-xs bg-lightGray" />
        <span>타 승객 좌석</span>
      </div>
      <div className="flex items-center gap-x-[10px]">
        <div className="h-5 w-5 rounded-xs border border-lightGray bg-white" />
        <span>빈 좌석</span>
      </div>
    </div>
  );
};

export default SeatChangeState;

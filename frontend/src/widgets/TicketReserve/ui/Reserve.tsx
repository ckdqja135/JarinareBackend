import ReserveTitle from './ReserveTitle';
import ReserveWay from './ReserveWay';

export const Reserve = () => {
  return (
    <>
      <ReserveTitle text="어디로 갈까요?" />
      <div className="flex w-full flex-col gap-y-3">
        <ReserveWay />
      </div>
    </>
  );
};

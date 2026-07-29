import { ReserveProps } from '../types/ReserveType';

const PlaceTitle = ({ text }: ReserveProps) => {
  return (
    <div className="mb-[25px] mt-[30px] flex w-full items-center">
      <span className="text-lg font-bold">{text}</span>
    </div>
  );
};

export default PlaceTitle;

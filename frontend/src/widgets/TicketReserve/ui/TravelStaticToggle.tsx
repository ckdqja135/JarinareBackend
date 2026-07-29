import { AgeOrGenderToggleType } from '../types/TravelStaticType';

export const TravelStaticToggle = ({
  age,
  gender,
  setAge,
  setGender,
}: AgeOrGenderToggleType) => {
  return (
    <div className="mb-[20px] flex w-full justify-start gap-2 text-tiny font-bold">
      <div
        onClick={() => {
          setAge(false);
          setGender(true);
        }}
        className={`cursor-pointer rounded-full px-5 py-2 ${age ? 'bg-white text-mediumGray shadow-sm' : 'bg-blue text-white'}`}
      >
        <span>나이대별</span>
      </div>
      <div
        onClick={() => {
          setAge(true);
          setGender(false);
        }}
        className={`cursor-pointer rounded-full px-5 py-2 ${gender ? 'bg-white text-mediumGray shadow-sm' : 'bg-blue text-white'}`}
      >
        <span>성별</span>
      </div>
    </div>
  );
};

import { useTravelStatic } from '../hooks/useTravelStatic';
import { TravelStatic } from './TravelStatic';
import { TravelStaticToggle } from './TravelStaticToggle';

export const Static = () => {
  const { age, gender, setAge, setGender } = useTravelStatic();
  return (
    <>
      <div className="mb-[25px] mt-[30px] flex w-full items-center justify-start">
        <span className="text-lg font-bold">여행지 통계</span>
      </div>
      <TravelStaticToggle
        age={age}
        gender={gender}
        setAge={setAge}
        setGender={setGender}
      />
      <TravelStatic age={age} />
    </>
  );
};

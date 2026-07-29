import { ChocieReusltListProps } from '../types/ReserveType';

const ChoiceResultList = ({ title, text }: ChocieReusltListProps) => {
  return (
    <div className="flex justify-between">
      <span className="text-mediumGray">{title}</span>
      <span>{text}</span>
    </div>
  );
};

export default ChoiceResultList;

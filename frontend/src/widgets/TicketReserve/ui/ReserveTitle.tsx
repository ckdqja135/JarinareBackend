import { Link } from 'react-router-dom';
import { ReserveTitleProp } from '../types/ReserveType';

const ReserveTitle = ({ text, showMore = true }: ReserveTitleProp) => {
  return (
    <div className="mb-[20px] mt-[24px] flex w-full items-start justify-between">
      {text === '어디로 갈까요?' ? (
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-darkGray">오늘은 어디로 떠나시나요?</span>
          <span className="text-lg font-bold leading-tight">
            여행의 시작,
            <br />
            여기서 찾으세요
          </span>
        </div>
      ) : (
        <>
          <span className="text-lg font-bold">{text}</span>
          {showMore && (
            <Link className="text-sm font-bold text-blue" to={'/ticketList'}>
              더보기
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default ReserveTitle;

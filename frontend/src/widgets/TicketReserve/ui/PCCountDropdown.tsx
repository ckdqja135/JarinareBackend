/**
 * @role: widgets — PC 인원 드롭다운
 * @rule: 렌더링만 담당, onClose prop으로 닫기 처리
 */
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { CountAdultButton } from './CountAdultButton';
import { CountKidButton } from './CountKidButton';

interface Props {
  onClose: () => void;
}

const PCCountDropdown = ({ onClose }: Props) => {
  const { adult, kid } = trainDataStore();

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">어른</span>
          <CountAdultButton />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">어린이</span>
          <CountKidButton />
        </div>
      </div>

      {(adult > 0 || kid > 0) && (
        <span className="mt-4 block text-xs font-bold text-darkGray">
          어른 <span className="text-blue">{adult < 0 ? 0 : adult}</span>명 •
          어린이 <span className="text-blue">{kid < 0 ? 0 : kid}</span>명
        </span>
      )}

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-xl bg-blue py-2.5 text-sm font-bold text-white"
      >
        선택
      </button>
    </div>
  );
};

export default PCCountDropdown;

/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, PC 좌석 컴포넌트 (좌석 번호 표시)
 */
import { PCSeatProps } from '../types/ReserveType';

const PCSeat = ({ bgColor, onClick, label }: PCSeatProps) => {
  const textColor = bgColor === 'blue' ? 'text-white' : 'text-gray-400';
  return (
    <div
      onClick={onClick ?? undefined}
      className={`bg-${bgColor} flex h-14 w-14 cursor-pointer items-center justify-center rounded-md border border-gray-200`}
    >
      <span className={`text-xs ${textColor}`}>{label}</span>
    </div>
  );
};

export default PCSeat;

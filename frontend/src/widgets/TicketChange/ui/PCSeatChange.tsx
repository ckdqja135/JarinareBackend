/**
 * @role: widgets — PC 좌석변경 좌석 컴포넌트
 * @rule: 렌더링만 담당, isChangeTarget 애니메이션 포함
 */
interface PCSeatChangeProps {
  label: string;
  bgColor: string;
  isChangeTarget?: boolean;
  onClick: () => void;
}

const PCSeatChange = ({
  label,
  bgColor,
  isChangeTarget,
  onClick,
}: PCSeatChangeProps) => {
  const textColor =
    bgColor === 'blue' || bgColor === 'green' ? 'text-white' : 'text-gray-400';

  return (
    <div
      onClick={onClick}
      className={`bg-${bgColor} flex h-14 w-14 cursor-pointer items-center justify-center rounded-md border border-gray-200 ${isChangeTarget ? 'animate-pulse' : ''}`}
    >
      <span className={`text-xs ${textColor}`}>{label}</span>
    </div>
  );
};

export default PCSeatChange;

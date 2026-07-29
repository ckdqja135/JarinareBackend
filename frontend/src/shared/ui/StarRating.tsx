/**
 * @role: shared — 부분 별점 표시 컴포넌트
 * @rule: 렌더링만 담당, 상태 및 비즈니스 로직 포함 금지
 */

type Props = {
  rating: number;
  size?: 'xs' | 'sm';
  showValue?: boolean;
};

const StarRating = ({ rating, size = 'xs', showValue = false }: Props) => {
  const textSize = size === 'sm' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        // 각 별의 채움 비율 (0~1)
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        const percent = Math.round(fill * 100);

        return (
          <span key={star} className={`relative ${textSize} text-gray-300`}>
            ★
            <span
              className={`absolute inset-0 overflow-hidden text-yellow-400`}
              style={{ width: `${percent}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-[10px] text-gray-500">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

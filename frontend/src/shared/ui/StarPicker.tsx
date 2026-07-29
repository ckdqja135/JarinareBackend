/**
 * @role: shared — 별점 선택 UI
 * @rule: 렌더링만 담당, 상태 포함 금지
 */
const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

export default StarPicker;

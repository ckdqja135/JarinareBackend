import { useHideInput } from '../hooks/PlaceInputHook';
import { ReservePlaceholder } from '../types/ReserveType';

const PlaceInput = ({ placeholder }: ReservePlaceholder) => {
  const { onChange } = useHideInput();
  return (
    <div className="relative flex w-[320px] items-center border-b-2 border-blue">
      <svg
        className="absolute left-1 h-4 w-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        autoComplete="off"
        onChange={onChange}
        className="h-12 w-full bg-transparent pl-8 pr-3 text-tiny outline-none placeholder:text-gray-400"
        placeholder={placeholder}
      />
    </div>
  );
};

export default PlaceInput;

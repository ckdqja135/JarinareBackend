/**
 * @role: widgets — PC 도착역 드롭다운 UI
 * @rule: 렌더링만 담당, onClose prop으로 닫기 처리
 */
import { usePCEndPlaceDropdown } from '../hooks/usePCEndPlaceDropdown';
import type { OnCloseProps } from '../types/PCDropdownTypes';

const PCEndPlaceDropdown = ({ onClose }: OnCloseProps) => {
  const {
    query,
    setQuery,
    filtered,
    isLoading,
    recommendStationArray,
    handleSelect,
  } = usePCEndPlaceDropdown(onClose);

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
      {/* 검색 */}
      <div className="border-b border-gray-100 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <svg
            className="h-4 w-4 shrink-0 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도착역 검색"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 추천역 */}
      {!query && (
        <div className="border-b border-gray-100 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-400">추천역</p>
          <div className="grid grid-cols-2 gap-1.5">
            {recommendStationArray.map(({ text, id }) => (
              <button
                key={id}
                onClick={() => handleSelect(id, text)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-darkGray hover:bg-gray-50"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lightBlue text-xs font-bold text-blue">
                  {text[0]}
                </div>
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 전체역 */}
      <div className="max-h-52 overflow-y-auto p-2">
        <p className="mb-1 px-2 text-xs font-semibold text-gray-400">전체역</p>
        {isLoading ? (
          <div className="py-4 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : (
          filtered.map((station) => {
            if (!station?.nodename) return null;
            return (
              <button
                key={station.nodeid}
                onClick={() => handleSelect(station.nodeid, station.nodename)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-gray-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lightBlue text-xs font-bold text-blue">
                  {station.nodename[0]}
                </div>
                <span className="text-sm font-semibold text-darkGray">
                  {station.nodename}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PCEndPlaceDropdown;

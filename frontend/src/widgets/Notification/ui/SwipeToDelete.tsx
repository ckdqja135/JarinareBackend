/**
 * @role: widgets — 스와이프 삭제 래퍼 컴포넌트
 * @rule: UI 렌더링만 담당, 스와이프 로직은 useSwipeToDelete에 위임
 */
import { SwipeToDeleteProps } from '../types/swipeToDeleteType';
import { useSwipeToDelete } from '../hooks/useSwipeToDelete';

const SwipeToDelete = ({ onDelete, children }: SwipeToDeleteProps) => {
  const {
    offsetX,
    dragging,
    handleStart,
    handleMove,
    handleEnd,
    SWIPE_THRESHOLD,
  } = useSwipeToDelete();

  return (
    <div className="relative mx-4 mb-1 mt-2">
      {/* 삭제 버튼 - 고정 위치, 카드 아래에 항상 렌더링 */}
      <div
        onClick={onDelete}
        className="absolute right-0 top-0 flex h-full cursor-pointer items-center justify-center rounded-r-2xl bg-red"
        style={{ width: `${SWIPE_THRESHOLD + 20}px` }}
      >
        <span className="text-xs font-bold text-white">삭제</span>
      </div>

      {/* 카드 - z-index로 버튼 위에서 왼쪽으로 슬라이드하며 버튼을 드러냄 */}
      <div
        style={{
          transform: `translateX(-${offsetX}px)`,
          transition: dragging.current ? 'none' : 'transform 0.2s ease',
          cursor: 'grab',
          position: 'relative',
          zIndex: 1,
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => {
          if (dragging.current) handleMove(e.clientX);
        }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div className="group relative">
          {children}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400/80 text-white opacity-0 transition-opacity hover:bg-gray-600 group-hover:opacity-100"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeToDelete;

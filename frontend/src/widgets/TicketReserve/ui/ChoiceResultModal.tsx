/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useChoiceResultModal } from '../hooks/useChoiceResultModal';

const ChoiceResultModal = () => {
  const {
    startTimeView,
    endTimeView,
    durationText,
    trainTypeDisplay,
    selectKid,
    selectAdult,
    selectPay,
    handleClose,
    handleConfirm,
  } = useChoiceResultModal();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40 lg:justify-center lg:backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-5 pt-4 lg:mb-0 lg:w-[440px] lg:animate-fade-up lg:rounded-2xl lg:px-8 lg:pb-5 lg:pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일 핸들 바 */}
        <div className="mb-5 flex justify-center lg:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* PC 헤더 */}
        <div className="mb-6 hidden lg:flex lg:items-start lg:justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">선택 확인</p>
            <p className="mt-0.5 text-xs text-gray-400">
              예매 전 선택 내용을 확인해주세요
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 모바일 제목 */}
        <p className="mb-4 text-base font-bold text-gray-800 lg:hidden">
          선택 확인
        </p>

        {/* 1. 시간 */}
        <div className="mb-2 rounded-xl bg-gray-50 px-4 py-2.5 lg:rounded-2xl">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-gray-400">시간</span>
            <span className="text-sm text-gray-400">소요시간</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-gray-900 lg:text-xl">
                {startTimeView}
              </span>
              <span className="text-gray-300 lg:text-lg">→</span>
              <span className="text-base font-bold text-gray-900 lg:text-xl">
                {endTimeView}
              </span>
            </div>
            <span className="text-base font-semibold text-gray-800">
              {durationText}
            </span>
          </div>
        </div>

        {/* 2. 열차 / 요금 */}
        <div className="mb-2 flex gap-2">
          <div className="flex flex-1 flex-col gap-0.5 rounded-xl bg-gray-50 px-4 py-2.5 lg:rounded-2xl">
            <span className="text-sm text-gray-400">열차</span>
            <span className="text-base font-bold text-gray-800">
              {trainTypeDisplay}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 rounded-xl bg-gray-50 px-4 py-2.5 lg:rounded-2xl">
            <span className="text-sm text-gray-400">요금</span>
            <span className="text-base font-bold text-blue">
              {Number(selectPay).toLocaleString('ko-KR')}원
            </span>
          </div>
        </div>

        {/* 3. 인원 */}
        <div className="mb-4 rounded-xl bg-gray-50 px-4 py-2.5 lg:rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">인원</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-800">
                어른 <span className="text-blue">{selectAdult}</span>명
              </span>
              <span className="text-gray-200">·</span>
              <span className="text-sm font-semibold text-gray-800">
                어린이 <span className="text-blue">{selectKid}</span>명
              </span>
            </div>
          </div>
        </div>

        {/* 4. 취소 / 좌석조회 */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-[2] rounded-2xl bg-blue py-3 text-sm font-bold text-white transition-colors hover:bg-blue/90"
          >
            좌석 조회
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoiceResultModal;

/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { usePayModal } from '../hooks/usePayModal';
import type { PaymentMethod } from '../constants/payModalConstants';

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  신용카드: (
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
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  간편결제: (
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
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
    </svg>
  ),
  계좌이체: (
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
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
};

const PayModal = () => {
  const {
    checked,
    value,
    eventSelected,
    handleEventChange,
    isDiscountEligible,
    basePrice,
    discountedBase,
    cardDiscount,
    cardPayback,
    cardDiscountRate,
    cardPaybackRate,
    bannerText,
    finalPrice,
    point,
    season,
    style,
    selectedPaymentMethod,
    selectedCard,
    selectedCardData,
    paymentMethods,
    cardList,
    handleTogglePoint,
    handleUseAllPoint,
    handlePointInput,
    handleSelectPaymentMethod,
    handleSelectCard,
    handleClose,
    handlePay,
    isPaying,
  } = usePayModal();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40 lg:justify-center lg:backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5 lg:mb-0 lg:w-[440px] lg:animate-fade-up lg:rounded-2xl lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일 핸들 바 */}
        <div className="mb-5 flex justify-center lg:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* PC 헤더 */}
        <div className="mb-5 hidden lg:flex lg:items-start lg:justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">결제하기</p>
            <p className="mt-0.5 text-xs text-gray-400">결제 하실 금액</p>
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

        <p className="mb-1 text-base font-bold text-gray-800 lg:hidden">
          결제 하실 금액
        </p>
        <p className="mb-4 text-3xl font-semibold text-gray-900">
          {basePrice.toLocaleString('ko-KR')}원
        </p>

        {/* 이벤트 드롭다운 */}
        <div className="mb-3">
          <p className="mb-1 text-xs font-bold text-gray-500">이벤트 선택</p>
          <div className="relative">
            <select
              value={eventSelected}
              onChange={handleEventChange}
              className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-8 text-sm outline-none ${
                eventSelected === 'season'
                  ? `border-current ${style.color} font-bold`
                  : 'border-lightGray text-gray-600'
              }`}
            >
              <option value="none">선택안함</option>
              {isDiscountEligible && (
                <option value="season">
                  {style.emoji} {season} 계절 10% 할인
                </option>
              )}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* 포인트 사용 */}
        <div className="mb-3 flex items-center gap-2">
          <input
            autoComplete="off"
            type="checkbox"
            id="check"
            checked={checked}
            onChange={handleTogglePoint}
            disabled={point === 0}
            className={`appearance-none rounded border border-blue p-2 ${checked ? "bg-blue bg-[url('@/assets/icons/point_check.png')] bg-center bg-no-repeat" : ''} ${point === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          <label htmlFor="check" className="flex">
            <span
              className={`${checked ? 'text-darkGray' : 'text-lightGray'} text-sm`}
            >
              포인트 사용
            </span>
          </label>
        </div>

        <div className="mb-3">
          <div
            className={`flex w-full justify-between gap-1 ${checked ? 'text-black' : 'text-lightGray'} h-9`}
          >
            <input
              type="text"
              disabled={!checked}
              placeholder={!checked ? '0' : ''}
              className="flex-1 rounded-lg border border-lightGray px-2 text-end text-sm placeholder:text-gray-300 disabled:bg-gray-50"
              value={
                !checked
                  ? ''
                  : value === null || value === 0
                    ? ''
                    : value.toLocaleString('ko-KR')
              }
              onChange={handlePointInput}
            />
            <button
              onClick={handleUseAllPoint}
              disabled={!checked}
              className="rounded-lg border border-lightGray bg-white px-4 text-xs shadow-sm active:brightness-95 disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
            >
              모두 사용
            </button>
          </div>
          <span className="mt-1 flex w-full justify-end text-xs text-darkGray">
            보유 포인트&nbsp;
            <span className="text-blue">{point.toLocaleString('ko-KR')}</span>
            &nbsp;원
          </span>
        </div>

        {/* 결제수단 선택 */}
        <div className="mb-3 hidden lg:block">
          <p className="mb-1.5 text-xs font-bold text-gray-400">결제수단</p>
          <div className="flex gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() => handleSelectPaymentMethod(method)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-bold transition-colors ${
                  selectedPaymentMethod === method
                    ? 'border-blue text-blue'
                    : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                {PAYMENT_METHOD_ICONS[method]}
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* 카드사 선택 */}
        {selectedPaymentMethod === '신용카드' && (
          <div className="mb-3 hidden lg:block">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="mb-1.5 text-xs text-gray-400">카드사 선택</p>
              <div className="grid grid-cols-4 gap-2">
                {cardList.map(({ name, badge, color, note, noteColor }) => (
                  <button
                    key={name}
                    onClick={() => handleSelectCard(name)}
                    className={`relative flex flex-col items-center gap-1.5 rounded border py-2.5 text-xs transition-colors ${
                      selectedCard === name
                        ? 'border-blue text-blue'
                        : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {note && (
                      <span
                        className="absolute -right-1.5 -top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none text-white"
                        style={{ backgroundColor: noteColor }}
                      >
                        {note}
                      </span>
                    )}
                    <span
                      className="flex h-4 w-8 items-center justify-center rounded-full text-[8px] font-black text-white"
                      style={{ backgroundColor: color }}
                    >
                      {badge}
                    </span>
                    {name}
                  </button>
                ))}
              </div>
              {selectedCardData && (
                <div
                  className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1.5"
                  style={{
                    backgroundColor: `${selectedCardData.bannerColor}18`,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: selectedCardData.bannerColor }}
                  >
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                  <p
                    className="text-[10px] font-bold"
                    style={{ color: selectedCardData.bannerColor }}
                  >
                    {bannerText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 금액 요약 */}
        <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
          <div className="flex justify-between text-sm font-bold text-gray-800">
            <span>최종 결제금액</span>
            <span>{finalPrice.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="my-2 w-full border border-gray-200" />
          <div className="flex flex-col gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">총 결제금액</span>
              <span className="text-gray-700">
                {basePrice.toLocaleString('ko-KR')}원
              </span>
            </div>
            {eventSelected === 'season' && isDiscountEligible && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {style.emoji} {season} 계절 할인 (10%)
                </span>
                <span className="text-orange-500">
                  -{(basePrice - discountedBase).toLocaleString('ko-KR')}원
                </span>
              </div>
            )}
            {checked && (
              <div className="flex justify-between">
                <span className="text-gray-400">포인트 사용</span>
                <span className="text-blue">
                  {value === null ? 0 : '-' + value.toLocaleString('ko-KR')}원
                </span>
              </div>
            )}
            {cardDiscount > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-gray-400">
                  <span>💳</span>
                  {selectedCard} 카드 할인 ({cardDiscountRate}%)
                </span>
                <span className="text-blue">
                  -{cardDiscount.toLocaleString('ko-KR')}원
                </span>
              </div>
            )}
            {cardPayback > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {selectedCard} 포인트 적립 ({cardPaybackRate}%)
                </span>
                <span className="text-teal-400">
                  +{cardPayback.toLocaleString('ko-KR')}원
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl bg-gray-100 py-3.5 text-base font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handlePay}
            disabled={isPaying}
            className={`flex-[2] rounded-xl py-3.5 text-base font-bold text-white transition-colors ${isPaying ? 'bg-gray-300' : 'bg-blue hover:bg-blue/90 active:brightness-95'}`}
          >
            {isPaying ? '처리 중...' : '결제'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayModal;

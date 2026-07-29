/**
 * @role: widgets — 포인트 내역 아이템 UI 컴포넌트
 * @rule: 데이터 가공 금지, 전달받은 props만 렌더링
 */
import donate from '@/assets/icons/donate.png';
import { PaymentType } from '@/entities/Point/types/paymentType';
import { formatMonthDay } from '@/shared/lib/formatDate';

export const Payment = ({ accruedPoint, createAt }: PaymentType) => {
  return (
    <div className="mx-4 my-2 flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center gap-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10">
          <img width={20} height={20} src={donate} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">포인트 지급</span>
          <span className="text-xs text-gray-400">
            {formatMonthDay(createAt)} | 자리나레
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-blue">
          +{Number(accruedPoint ?? 0).toLocaleString('ko-KR')} 원
        </span>
      </div>
    </div>
  );
};

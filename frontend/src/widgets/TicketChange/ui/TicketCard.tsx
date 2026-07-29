/**
 * @role: widgets — 티켓 카드 UI 컴포넌트
 * @rule: 데이터 가공 금지, 전달받은 props만 렌더링
 */
import QRCode from 'react-qr-code';
import { TicketCardProps } from '../types/TicketCardType';

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <span
      className={`text-sm ${bold ? 'font-bold text-blue' : 'font-semibold text-gray-800'}`}
    >
      {value}
    </span>
  </div>
);

const TicketCard = ({
  s,
  filtred,
  qrValue,
  startHH,
  startMM,
  endHH,
  endMM,
  durText,
}: TicketCardProps) => {
  return (
    <div className="rounded-2xl bg-white shadow-xl">
      {/* 파란 헤더 */}
      <div className="rounded-t-2xl bg-blue px-5 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
            {s.trainType}
          </span>
          <span className="text-xs text-white/80">{s.startDayForView}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black text-white">
              {s.startStationForView}
            </span>
            <span className="text-sm font-semibold text-white/80">
              {startHH}:{startMM}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              <div className="h-0 flex-1 border-t border-dashed border-white/50" />
              <span className="mx-1 inline-block -scale-x-100 text-lg leading-none">
                🚄
              </span>
              <div className="h-0 flex-1 border-t border-dashed border-white/50" />
            </div>
            <span className="text-[10px] text-white/70">{durText}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black text-white">
              {s.endStationForView}
            </span>
            <span className="text-sm font-semibold text-white/80">
              {endHH}:{endMM}
            </span>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="px-5 py-4">
        <div className="flex flex-col gap-3">
          <Row
            label="호차 / 좌석"
            value={`${s.trainNoId}호차  ${filtred.join(', ')}`}
          />
          <Row
            label="인원"
            value={`어른 ${s.selectAdult}명 · 어린이 ${s.selectKid}명`}
          />
          <Row
            label="요금"
            value={`${s.selectPay.toLocaleString('ko-KR')}원`}
            bold
          />
        </div>
      </div>

      {/* 절취선 + QR */}
      <div className="flex items-center py-3">
        <div className="mx-5 flex-1 border-t-2 border-dashed border-gray-300" />
      </div>
      <div className="flex flex-col items-center gap-2 px-5 pb-5">
        <QRCode value={qrValue} size={120} level="L" />
        <a
          href={qrValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue underline"
        >
          링크로 열기
        </a>
      </div>
    </div>
  );
};

export default TicketCard;

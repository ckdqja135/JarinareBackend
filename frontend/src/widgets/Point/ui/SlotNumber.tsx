/**
 * @role: widgets — 포인트 슬롯머신 애니메이션 UI 컴포넌트
 * @rule: 애니메이션 상태는 내부 관리, 외부 비즈니스 로직 포함 금지
 */
import { useEffect, useRef, useState } from 'react';
import { SlotNumberProps } from '../types/SlotNumberType';

const DURATION = 1200;
const STEPS = 30;

const SlotNumber = ({ value, className = '' }: SlotNumberProps) => {
  const [display, setDisplay] = useState<number | null>(null);
  const prevValue = useRef(-1);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // easeOut 기반 숫자 슬롯 애니메이션
  useEffect(() => {
    const start = prevValue.current < 0 ? 0 : prevValue.current;
    const end = value;
    let step = 0;

    if (frameRef.current) clearInterval(frameRef.current);

    frameRef.current = setInterval(() => {
      step++;
      const progress = step / STEPS;
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + (end - start) * eased));

      if (step >= STEPS) {
        clearInterval(frameRef.current!);
        setDisplay(end);
        prevValue.current = end;
      }
    }, DURATION / STEPS);

    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, [value]);

  return (
    <span className={className}>
      {(display ?? 0).toLocaleString('ko-KR')} 원
    </span>
  );
};

export default SlotNumber;

/**
 * @role: widgets — 계절별 아이콘 SVG 컴포넌트
 * @rule: 렌더링만 담당, props로 계절 수신
 */
import type { Season } from '@/shared/constants/seasonStations';

interface Props {
  season: Season;
}

const SeasonIcon = ({ season }: Props) => {
  if (season === '봄')
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="white" />
        <ellipse cx="12" cy="6" rx="2" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="12" cy="18" rx="2" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="6" cy="12" rx="3" ry="2" fill="white" opacity="0.9" />
        <ellipse cx="18" cy="12" rx="3" ry="2" fill="white" opacity="0.9" />
        <ellipse
          cx="7.76"
          cy="7.76"
          rx="2"
          ry="3"
          fill="white"
          opacity="0.7"
          transform="rotate(45 7.76 7.76)"
        />
        <ellipse
          cx="16.24"
          cy="16.24"
          rx="2"
          ry="3"
          fill="white"
          opacity="0.7"
          transform="rotate(45 16.24 16.24)"
        />
        <ellipse
          cx="16.24"
          cy="7.76"
          rx="2"
          ry="3"
          fill="white"
          opacity="0.7"
          transform="rotate(-45 16.24 7.76)"
        />
        <ellipse
          cx="7.76"
          cy="16.24"
          rx="2"
          ry="3"
          fill="white"
          opacity="0.7"
          transform="rotate(-45 7.76 16.24)"
        />
      </svg>
    );

  if (season === '여름')
    return (
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" fill="white" stroke="none" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
        <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
        <line x1="19.07" y1="4.93" x2="16.95" y2="7.05" />
        <line x1="7.05" y1="16.95" x2="4.93" y2="19.07" />
      </svg>
    );

  if (season === '가을')
    return (
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="white"
        stroke="none"
      >
        <path
          d="M12 2C8 2 4 6 4 10c0 2 1 4 2.5 5.5C5 17 4 19 4 21c0 0 2-1 4-3 1 1 2.5 1.5 4 1.5 4 0 8-3.5 8-8S16 2 12 2z"
          opacity="0.9"
        />
        <path
          d="M12 8c0 0-3 3-3 6"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="16.24" y2="7.76" />
      <line x1="7.76" y1="16.24" x2="4.93" y2="19.07" />
    </svg>
  );
};

export default SeasonIcon;

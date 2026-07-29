/**
 * @role: pages — 마이페이지 상수 정의
 * @rule: 상수 정의만 담당, 로직 포함 금지
 */
import kakaoIcon from '@/assets/social/kakao.png';
import googleIcon from '@/assets/social/google.png';
import naverIcon from '@/assets/social/naver.png';
import githubIcon from '@/assets/social/github.png';
import { PeriodFilter } from '../types/myPageTypes';

export const PERIOD_OPTIONS: PeriodFilter[] = ['1개월', '3개월', '6개월'];
export const TYPE_OPTIONS = ['전체', '구매', '반환'] as const;
export const POINT_TYPE_OPTIONS = ['전체', '적립', '사용'] as const;
export const SORT_OPTIONS = ['최신순', '과거순'] as const;

export const PERIOD_MONTHS: Record<PeriodFilter, number> = {
  '1개월': 1,
  '3개월': 3,
  '6개월': 6,
};

export const PROVIDER_BADGE: Record<string, { icon: string; label: string; bg: string }> = {
  'oidc.kakao': { icon: kakaoIcon, label: '카카오', bg: '#FEE500' },
  'google.com':  { icon: googleIcon,  label: '구글',   bg: '#ffffff' },
  'naver.com':   { icon: naverIcon,   label: '네이버', bg: '#03C75A' },
  'github.com':  { icon: githubIcon,  label: 'GitHub', bg: '#24292e' },
};

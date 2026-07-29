/**
 * @role: pages — 마이페이지 타입 정의
 * @rule: 타입 정의만 담당, 로직 포함 금지
 */
export type FilterTab = 'payment' | 'point';
export type PeriodFilter = '1개월' | '3개월' | '6개월';
export type TypeFilter = '전체' | '구매' | '반환';
export type PointTypeFilter = '전체' | '적립' | '사용';
export type SortOrder = '최신순' | '과거순';
export type FollowTab = 'followers' | 'following';

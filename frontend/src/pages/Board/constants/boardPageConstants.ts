/**
 * @role: pages — PC 게시판 페이지 상수
 * @rule: 상수 정의만 담당
 */
import { BoardFilter, PostCategory } from '../types/boardPageType';

export const CAT_STYLE_MAP: Record<
  PostCategory,
  {
    badge: string;
    bgColor: string;
    textColor: string;
    path: string;
    stateKey: string;
  }
> = {
  board: {
    badge: '자유',
    bgColor: '#dcfce7',
    textColor: '#16a34a',
    path: '/board/board/detail',
    stateKey: 'post',
  },
  notice: {
    badge: '공지',
    bgColor: '#dbeafe',
    textColor: '#2563eb',
    path: '/board/notice/detail',
    stateKey: 'notice',
  },
  event: {
    badge: '이벤트',
    bgColor: '#ffedd5',
    textColor: '#f97316',
    path: '/board/event/detail',
    stateKey: 'event',
  },
};

// 통합게시판 카드 높이 계산용 (Tailwind py-4/py-3 기준 px)
export const BOARD_CARD_HEADER_H = 60;
export const BOARD_ROW_H = 56;
export const BOARD_PAGINATION_H = 44;

export const FILTER_TABS: { label: BoardFilter }[] = [
  { label: '전체' },
  { label: '공지' },
  { label: '이벤트' },
  { label: '자유' },
];
export const BOARD_DROPDOWN_ITEMS = [
  { label: '전체', path: '/board/boardlist' },
  { label: '공지사항', path: '/board/noticelist' },
  { label: '이벤트', path: '/board/eventlist' },
  { label: '자유게시판', path: '/board/boardlist' },
];

export const BOARD_CATEGORIES = [
  {
    key: 'notice' as const,
    label: '공지사항',
    path: '/board/noticelist',
    bgColor: '#dbeafe',
    textColor: '#2563eb',
    iconStroke: '#2563eb',
  },
  {
    key: 'event' as const,
    label: '이벤트',
    path: '/board/eventlist',
    bgColor: '#ffedd5',
    textColor: '#f97316',
    iconStroke: '#f97316',
  },
  {
    key: 'board' as const,
    label: '자유게시판',
    path: '/board/boardlist',
    bgColor: '#dcfce7',
    textColor: '#16a34a',
    iconStroke: '#16a34a',
  },
  {
    key: 'review' as const,
    label: '여행지 후기',
    path: '/travel/review/list',
    bgColor: '#fef9c3',
    textColor: '#ca8a04',
    iconStroke: '#ca8a04',
  },
];

export const BOARDS = [
  {
    key: 'notice' as const,
    label: '공지사항',
    path: '/board/noticelist',
    badge: '공지',
    bgColor: '#dbeafe',
    textColor: '#2563eb',
  },
  {
    key: 'event' as const,
    label: '이벤트',
    path: '/board/eventlist',
    badge: '이벤트',
    bgColor: '#ffedd5',
    textColor: '#f97316',
  },
  {
    key: 'board' as const,
    label: '자유게시판',
    path: '/board/boardlist',
    badge: '자유',
    bgColor: '#dcfce7',
    textColor: '#16a34a',
  },
  {
    key: 'board2' as const,
    label: '자유게시판',
    path: '/board/boardlist',
    badge: '자유',
    bgColor: '#dcfce7',
    textColor: '#16a34a',
  },
];

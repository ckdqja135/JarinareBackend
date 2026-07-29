/**
 * @role: pages — 메뉴 상수 정의
 * @rule: 상수 정의만 담당, 로직 포함 금지
 */
import on_board from '@/assets/icons/on_board.png';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import on_user from '@/assets/icons/on_user.png';
import returned from '@/assets/icons/returned.png';
import on_key from '@/assets/icons/on_key.png';
import join from '@/assets/icons/join.png';
import type { MenuItem } from '../types/menuType';

export const BOARD_SUB_ITEMS = [
  { text: '공지사항', link: '/board/noticelist' },
  { text: '이벤트', link: '/board/eventlist' },
  { text: '자유게시판', link: '/board/boardlist' },
  { text: '여행지 후기', link: '/travel/review/list' },
];

export const MenuConstants = (): MenuItem[] => {
  const user = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (user) {
    return [
      { text: '마이페이지', link: '/mypage', icon: on_user },
      { text: '승차권 반환', link: '/returnlist', icon: returned },
      { text: '게시판', icon: on_board, subItems: BOARD_SUB_ITEMS },
    ];
  } else {
    return [
      { text: '로그인', link: '/auth/login', icon: on_key },
      { text: '회원가입', link: '/auth/signup', icon: join },
      { text: '승차권 반환', link: '/returnlist', icon: returned },
      { text: '마이페이지', link: '/mypage', icon: on_user },
    ];
  }
};

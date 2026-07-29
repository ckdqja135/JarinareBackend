import off_home from '@/assets/icons/off_home.png';
import off_key from '@/assets/icons/off_key.png';
import off_user from '@/assets/icons/off_user.png';
import on_user from '@/assets/icons/on_user.png';
import off_menu from '@/assets/icons/off_menu.png';
import off_board from '@/assets/icons/off_board.png';
import on_home from '@/assets/icons/on_home.png';
import on_key from '@/assets/icons/on_key.png';
import on_menu from '@/assets/icons/on_menu.png';
import on_board from '@/assets/icons/on_board.png';

import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const NavBarConstants = () => {
  const user = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (user) {
    return [
      {
        on_icon: on_home,
        off_icon: off_home,
        text: '홈',
        path: '/',
      },
      {
        on_icon: on_board,
        off_icon: off_board,
        text: '게시판',
        path: '/board',
      },
      {
        on_icon: on_user,
        off_icon: off_user,
        text: '마이',
        path: '/mypage',
      },
      {
        on_icon: on_menu,
        off_icon: off_menu,
        text: '메뉴',
        path: '/menu',
      },
    ];
  } else {
    return [
      {
        on_icon: on_home,
        off_icon: off_home,
        text: '홈',
        path: '/',
      },
      {
        on_icon: on_board,
        off_icon: off_board,
        text: '게시판',
        path: '/board',
      },
      {
        on_icon: on_key,
        off_icon: off_key,
        text: '로그인',
        path: '/auth/login',
      },
      {
        on_icon: on_menu,
        off_icon: off_menu,
        text: '메뉴',
        path: '/menu',
      },
    ];
  }
};

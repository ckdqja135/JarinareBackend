/**
 * @role: app — hooks
 * @rule: 라우트 변경 시 모달 스토어 초기화만 담당, UI 포함 금지
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useReserveModalStore from '@/widgets/model/ReserveStore';
import useReturnModalStore from '@/widgets/model/TicketReturnStore';

export const useModalRouteReset = () => {
  const {
    isShow: reserveIsShow,
    modalType: reserveType,
    closeModal: closeReserve,
  } = useReserveModalStore();
  const {
    isShow: returnIsShow,
    modalType: returnType,
    closeModal: closeReturn,
  } = useReturnModalStore();
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    if (reserveIsShow && reserveType) closeReserve(reserveType);
    if (returnIsShow && returnType) closeReturn(returnType);
  }, [pathname]);
};

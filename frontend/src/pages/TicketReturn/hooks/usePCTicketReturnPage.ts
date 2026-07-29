/**
 * @role: pages/TicketReturn — hooks
 * @rule: PC 반환 페이지 핸들러만 담당, UI 포함 금지
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import useModalStore from '@/widgets/model/TicketReturnStore';
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const usePCTicketReturnPage = () => {
  const { setSeatsReturnData } = seatsReturnDataStore();
  const { openModal, isShow, modalType } = useModalStore();
  const { groupedArray } = useTicketLists() ?? {};
  const navigate = useNavigate();

  const handleReturnPC = (groups: SeatType[]) => {
    setSeatsReturnData(groups);
    openModal('ReturnModal');
  };

  const handleNavigateHome = () => navigate('/');
  const handleLoginNavigate = () => navigate('/auth/login');

  return {
    handleReturnPC,
    handleNavigateHome,
    handleLoginNavigate,
    isShow,
    modalType,
    isEmpty: !groupedArray || groupedArray.length === 0,
    isLoggedIn: !!localStorage.getItem(ACCESS_TOKEN_KEY),
  };
};

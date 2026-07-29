/**
 * @role: widgets/TicketReserve — hooks
 * @rule: ReserveTicket 렌더링에 필요한 파생 데이터 계산만 담당, UI 포함 금지
 */
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatAM_PM, formatTimeView } from '@/shared/lib/formatDate';
import { useNavigation } from './ReserveHook';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const useReserveTicket = () => {
  const ticketData = useTicketLists();
  const { navigate } = useNavigation();
  const navigateTo = useNavigate();

  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY);
  const handleLoginNavigate = () => navigateTo('/auth/login');

  if (!ticketData?.groupedArray || ticketData.groupedArray.length === 0) {
    return { isEmpty: true, isLoggedIn, handleLoginNavigate };
  }

  const groups = ticketData.groupedArray[0];
  const ticket = groups[0];

  const trainTypeName = (() => {
    const parts = ticket.trainType.split('-');
    const first = parts[0];
    const namePart = parts[1]?.split('(')[0] ?? '';
    return namePart ? `${first} ${namePart}` : first;
  })();

  const startLabel =
    formatAM_PM(String(ticket.startTime)) < 12
      ? `오전 ${formatTimeView(String(ticket.startTime))}`
      : `오후 ${formatTimeView(String(ticket.startTime))}`;

  const endLabel =
    formatAM_PM(String(ticket.endTime)) < 12
      ? `오전 ${formatTimeView(String(ticket.endTime))}`
      : `오후 ${formatTimeView(String(ticket.endTime))}`;

  const startTimeStr = String(ticket.startTime);
  const dotDate = `${startTimeStr.slice(0, 4)}.${startTimeStr.slice(4, 6)}.${startTimeStr.slice(6, 8)}`;

  const seatIds = groups.map((g) => g.seatId).join(', ');

  const handleDetail = () => {
    navigate('/ticketlist');
  };

  const handleSeatChange = () => {
    navigateTo('/seatchange', { state: groups });
  };

  return {
    isEmpty: false,
    isLoggedIn,
    handleLoginNavigate,
    ticket,
    trainTypeName,
    startLabel,
    endLabel,
    dotDate,
    seatIds,
    handleDetail,
    handleSeatChange,
  };
};

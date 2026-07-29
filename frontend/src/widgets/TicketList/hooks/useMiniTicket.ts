/**
 * @role: widgets/TicketList — hooks
 * @rule: MiniTicket 렌더링에 필요한 파생 데이터 계산만 담당, UI 포함 금지
 */
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatTimeView } from '@/shared/lib/formatDate';
import { WEEK_DAYS } from '../constants/miniTicketConstants';

const calcDuration = (start: number, end: number): string => {
  const sh = parseInt(String(start).substring(8, 10));
  const sm = parseInt(String(start).substring(10, 12));
  const eh = parseInt(String(end).substring(8, 10));
  const em = parseInt(String(end).substring(10, 12));
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  if (diff >= 60)
    return `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ''}`;
  return `${diff}분`;
};

export const useMiniTicket = () => {
  const { groupedArray } = useTicketLists() ?? {};

  if (!groupedArray || groupedArray.length === 0) {
    return { items: [], isEmpty: true };
  }

  const items = groupedArray.map((groups) => {
    const ticket = groups[0];

    const trainTypeName = (() => {
      const parts = ticket.trainType.split('-');
      const first = parts[0];
      const rawPart = parts[1] ?? '';
      const namePart = rawPart.split('(')[0];
      const parenContent = rawPart.split('(')[1] ?? '';
      const suffix = parenContent.startsWith('A')
        ? 'A'
        : parenContent.startsWith('B')
          ? 'B'
          : '';
      const fullName = namePart + suffix;
      return fullName ? `${first} ${fullName}` : first;
    })();

    const startTimeStr = String(ticket.startTime);
    const endTimeStr = String(ticket.endTime);

    const startLabel = formatTimeView(startTimeStr);
    const endLabel = formatTimeView(endTimeStr);

    const startAmPm = Number(startTimeStr.slice(8, 10)) < 12 ? '오전' : '오후';
    const endAmPm = Number(endTimeStr.slice(8, 10)) < 12 ? '오전' : '오후';

    const dotDate = `${startTimeStr.slice(0, 4)}.${startTimeStr.slice(4, 6)}.${startTimeStr.slice(6, 8)}`;

    const dateObj = new Date(
      Number(startTimeStr.slice(0, 4)),
      Number(startTimeStr.slice(4, 6)) - 1,
      Number(startTimeStr.slice(6, 8)),
    );
    const koreanDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일(${WEEK_DAYS[dateObj.getDay()]})`;

    const duration = calcDuration(ticket.startTime, ticket.endTime);

    const ticketNo = `JR-${startTimeStr.slice(2, 4)}${startTimeStr.slice(8, 12)}-${ticket.seatId}`;

    return {
      groups,
      ticket,
      trainTypeName,
      startLabel,
      endLabel,
      startAmPm,
      endAmPm,
      dotDate,
      koreanDate,
      duration,
      ticketNo,
      startTimeStr,
    };
  });

  return { items, isEmpty: false };
};

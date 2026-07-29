/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import ReserveTicket from './ReserveTicket';
import ReserveTitle from './ReserveTitle';

export const Ticket = () => {
  return (
    <>
      <ReserveTitle text="내 승차권" />
      <div className="mb-[20px]">
        <ReserveTicket />
      </div>
    </>
  );
};

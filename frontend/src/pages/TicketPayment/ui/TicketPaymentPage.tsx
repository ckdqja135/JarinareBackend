import arrow from '@/assets/icons/arrow.png';
import TicketButton from '@/shared/ui/TicketButton';
import { usePyamentState } from '../hooks/TicketPaymentHook';

const TicketPaymentPage = () => {
  const { payment, setPayemnt } = usePyamentState();
  return (
    <div className="flex w-full flex-col items-center pl-[38px] pr-[37px]">
      <div className="mt-[30px] w-full">
        <div className="flex justify-center text-lg font-bold">
          <span>서울</span>
          <img src={arrow} width={25} height={20} className="mx-[30px]" />
          <span>대전</span>
        </div>
        <div className="mt-[55px]" />
        <div className={`${payment ? 'mt-[60px]' : 'mt-[20px]'} flex flex-col`}>
          {payment ? null : (
            <span className="mb-[20px] flex w-full justify-center text-base font-bold text-mediumGray">
              <span className="text-red">3분 20초&nbsp;</span>안에 결제해
              주세요.
            </span>
          )}
          <TicketButton
            onClick={() => setPayemnt(true)}
            text={payment ? '결제된 승차권 입니다.' : '결제'}
            bgColor={payment ? 'lightBlue' : 'blue'}
            textColor={payment ? 'blue' : 'white'}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketPaymentPage;

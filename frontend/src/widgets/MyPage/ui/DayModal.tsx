import Calendar from 'react-calendar';
import '@/widgets/TicketReserve/styles/react-calendar.css';
import moment from 'moment';
import prev from '@/assets/icons/prev.png';
import next from '@/assets/icons/next.png';
import Button from '@/shared/ui/Button';
import { useDaySelect } from '../hooks/MyPageHook';
import useModalStore from '@/widgets/model/MyaPageStore';

const DayModal = () => {
  const { value, onChange } = useDaySelect();
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[380px] w-[345px] flex-col items-center rounded-2xl bg-white">
        <span className="w-full pl-[40px] pt-[25px] text-base font-bold">
          가는 날
        </span>
        <Calendar
          onChange={onChange}
          prev2Label={null}
          next2Label={null}
          prevLabel={
            <div className="flex h-[20px] w-[20px] items-center justify-start">
              <img width={9} height={15} src={prev} />
            </div>
          }
          nextLabel={
            <div className="flex h-[20px] w-[20px] items-center justify-end">
              <img width={9} height={15} src={next} />
            </div>
          }
          value={value}
          formatDay={(_, date) => moment(date).format('DD')}
        />
        <div className="mb-[15px]">
          <Button
            bgColor="blue"
            text="선택"
            textColor="white"
            onModalClick={() => closeModal('DayModal')}
          />
        </div>
      </div>
    </div>
  );
};

export default DayModal;

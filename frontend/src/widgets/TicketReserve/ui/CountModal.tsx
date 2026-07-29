import useModalStore from '../../model/ReserveStore';
import { CountAdultButton } from './CountAdultButton';
import { CountKidButton } from './CountKidButton';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const CountModal = () => {
  const { closeModal } = useModalStore();
  const { kid, adult } = trainDataStore();
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40 lg:justify-center"
      onClick={() => closeModal('CountModal')}
    >
      <div
        className="mb-4 w-[319px] animate-slide-up rounded-3xl bg-white px-8 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">어른</span>
            <CountAdultButton />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">어린이</span>
            <CountKidButton />
          </div>
        </div>

        {kid > 0 || adult > 0 ? (
          <span className="mt-5 block text-tiny font-bold text-darkGray">
            어른 <span className="text-blue">{adult < 0 ? 0 : adult}</span>명 •
            어린이 <span className="text-blue">{kid < 0 ? 0 : kid}</span>명
          </span>
        ) : null}

        <button
          onClick={() => closeModal('CountModal')}
          className="mt-6 w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white"
        >
          선택
        </button>
      </div>
    </div>
  );
};

export default CountModal;

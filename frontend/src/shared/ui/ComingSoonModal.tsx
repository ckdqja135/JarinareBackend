import { useNavigation } from '../hooks/useNavigate';
import globalModalStore from '../models/globalModalStore';

export const ComingSoonModal = () => {
  const { navigate } = useNavigation();
  const { closeModal } = globalModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[200px] w-[260px] flex-col items-center rounded-2xl bg-white px-[20px] pt-[55px] font-bold">
        <span className="flex w-full justify-center text-base">
          서비스 준비 중입니다.
        </span>
        <div className="mt-[30px] flex w-full justify-center text-base">
          <button
            className={`h-12 w-[100px] rounded-xs bg-lightBlue text-base text-blue active:brightness-50`}
            onClick={() => {
              closeModal('ComingSoonModal');
              navigate('/');
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

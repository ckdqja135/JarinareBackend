import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import useModalStore from '@/widgets/model/MyaPageStore';
import Modal from '@/widgets/MyPage/ui/Modal';
import UserInfo from '@/widgets/MyPage/ui/UserInfo';
import { useNaviation } from '../hooks/useNavigation';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import SlotNumber from '@/widgets/Point/ui/SlotNumber';
import PCMyPage from './PCMyPage';

const MyPage = () => {
  const { isShow, modalType } = useModalStore();
  const { point } = useGetPoint();
  const { navigate } = useNaviation();

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCMyPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex h-screen w-full flex-col overflow-y-auto bg-gray-100 lg:hidden">
        {/* 상단 헤더 */}
        <div className="flex w-full flex-col px-[28px]">
          <BackWardPageButton title="마이페이지" />
        </div>

        <div className="flex flex-col gap-y-3 px-[18px] pt-[20px]">
          {/* 유저 정보 카드 */}
          <UserInfo />

          {/* 포인트 카드 */}
          <div
            className="flex w-full flex-col justify-between rounded-xl bg-blue px-5 py-6 shadow-sm"
            style={{ minHeight: '180px' }}
          >
            <div className="flex flex-col gap-y-4">
              <span className="text-sm font-medium text-white">내 포인트</span>
              <SlotNumber
                value={point}
                className="text-3xl font-bold text-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/mypage/point')}
                className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white transition-all active:brightness-95"
              >
                더보기
              </button>
            </div>
          </div>

          {/* 앱 정보 섹션 */}
          <div className="flex flex-col gap-y-2">
            <span className="px-1 text-xs font-bold text-gray-400">
              앱 정보
            </span>
            <div className="flex w-full flex-col rounded-xl bg-white shadow-sm">
              <div className="flex w-full items-center justify-between px-5 py-4">
                <div className="flex items-center gap-x-3">
                  <span className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                    v
                  </span>
                  <span className="text-sm font-medium text-black">버전</span>
                </div>
                <span className="text-sm text-gray-400">1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {isShow == false || modalType == undefined ? null : <Modal />}
      </div>
    </>
  );
};

export default MyPage;

/**
 * @role: pages — 설정 페이지 (PC + 모바일)
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import PCLoginRequiredPage from '@/widgets/layouts/ui/PCLoginRequiredPage';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { Toggle } from '@/widgets/Notification/ui/Toggle';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';
import { useSettingPage } from '../hooks/useSettingPage';

const SettingPage = () => {
  const {
    isLoggedIn,
    handleLoginNavigate,
    isNotification,
    changeOn,
    responseOn,
    allOn,
    handleAllToggle,
    handleChangeToggle,
    handleResponseToggle,
  } = useSettingPage();

  if (!isLoggedIn) {
    return (
      <>
        {/* PC */}
        <div className="hidden w-full lg:block">
          <PCLoginRequiredPage
            description="로그인 후 설정을 이용할 수 있어요"
            onLogin={handleLoginNavigate}
          />
        </div>
        {/* 모바일 */}
        <div className="flex min-h-screen w-full flex-col bg-gray-100 lg:hidden">
          <div className="bg-gray-100 px-[28px]">
            <BackWardPageButton title="설정" />
          </div>
          <div className="flex flex-1 items-center justify-center pb-20">
            <LoginRequiredBlock
              description="로그인 후 설정을 이용할 수 있어요"
              onLogin={handleLoginNavigate}
              size="md"
            />
          </div>
        </div>
      </>
    );
  }

  if (!isNotification) return null;

  return (
    <>
      {/* PC */}
      <div className="hidden w-full lg:block">
        <div className="flex min-h-screen w-full flex-col bg-gray-50">
          <PCTopNav />
          <div className="flex w-full flex-1 gap-0">
            <PCSidebar />
            <main
              className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
              style={{ height: 'calc(100vh - 3.5rem)' }}
            >
              <div className="mx-auto max-w-2xl px-10 pb-16 pt-10">
                <h1 className="mb-6 text-2xl font-black text-gray-900">설정</h1>

                <section className="flex flex-col gap-4">
                  <h2 className="text-sm font-bold text-gray-400">알림</h2>

                  <div className="rounded-xl bg-white shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900">전체 알림</span>
                        <span className="text-xs text-gray-400">모든 알림을 한번에 켜고 끕니다</span>
                      </div>
                      <Toggle toggle={allOn} handleToggle={handleAllToggle} />
                    </div>
                  </div>

                  <div className="rounded-xl bg-white shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900">좌석 변경 요청</span>
                        <span className="text-xs text-gray-400">다른 사용자의 변경 요청 알림</span>
                      </div>
                      <Toggle toggle={changeOn} handleToggle={handleChangeToggle} />
                    </div>
                    <div className="mx-6 border-t border-gray-100" />
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900">수락 / 거절 알림</span>
                        <span className="text-xs text-gray-400">변경 요청 수락 또는 거절 알림</span>
                      </div>
                      <Toggle toggle={responseOn} handleToggle={handleResponseToggle} />
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* 모바일 */}
      <div className="flex min-h-screen w-full flex-col bg-gray-100 lg:hidden">
        <div className="bg-gray-100 px-[28px]">
          <BackWardPageButton title="설정" />
        </div>

        <div className="mt-2 px-[28px]">
          <p className="mb-3 text-xs font-bold text-gray-400">알림</p>

          <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-gray-900">전체 알림</span>
                <span className="text-xs text-gray-400">모든 알림을 한번에 켜고 끕니다</span>
              </div>
              <Toggle toggle={allOn} handleToggle={handleAllToggle} />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-gray-900">좌석 변경 요청</span>
                <span className="text-xs text-gray-400">다른 사용자의 변경 요청 알림</span>
              </div>
              <Toggle toggle={changeOn} handleToggle={handleChangeToggle} />
            </div>
            <div className="mx-5 border-t border-gray-100" />
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-gray-900">수락 / 거절 알림</span>
                <span className="text-xs text-gray-400">변경 요청 수락 또는 거절 알림</span>
              </div>
              <Toggle toggle={responseOn} handleToggle={handleResponseToggle} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingPage;

import { Login } from '@/features/Auth/Login/model/LoginSchema';
import LoginList from '@/widgets/Auth/Login/ui/LoginList';
import Modal from '@/widgets/Auth/Login/ui/Modal';
import SocialLoginList from '@/widgets/Auth/Login/ui/SocialLoginList';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';
import { FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLoginPage } from '../hooks/useLoginPage';

const LoginPage = () => {
  const { isShow, modalType } = useModalStore();
  const { method: pcMethod } = Login();
  const { method: mobileMethod } = Login();

  const formOpen =
    isShow && (modalType === 'EmailModal' || modalType === 'PasswordModal');

  useLoginPage(formOpen);

  return (
    <>
      {/* PC 버전 */}
      <FormProvider {...pcMethod}>
        <div
          className="hidden h-screen w-full lg:grid"
          style={{ gridTemplateColumns: '1fr 3fr' }}
        >
          {/* 왼쪽 패널 */}
          <div
            className="relative flex flex-col justify-between overflow-hidden p-8 text-white"
            style={{
              background:
                'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)',
            }}
          >
            {/* 오른쪽 위 큰 구 */}
            <div className="absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full bg-white/10" />
            {/* 왼쪽 아래 작은 구 */}
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/10" />
            {/* 상단 — 링크 텍스트 */}
            <Link
              to="/"
              className="text-2xl font-semibold tracking-[0.1em] text-white transition-opacity hover:opacity-80"
            >
              JARINARE
            </Link>

            {/* 중앙 — 제목 + 핵심 텍스트 */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col">
                <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-white/50">
                  HIGH-SPEED RAIL
                </p>
                <h2 className="text-5xl font-semibold leading-snug">
                  빠르고 편안한
                  <br />
                  기차 여행의 시작
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  전국 어디든 한번의 예매, 좌석 선택부터 실시간 운행 정보까지,
                  JARINARE와 함께하세요
                </p>
              </div>
              <div className="flex flex-row gap-6">
                {[
                  { big: '120+', small: '운행노선' },
                  { big: '98%', small: '정시 도착률' },
                  { big: '24H', small: '고객 지원' },
                ].map(({ big, small }) => (
                  <div key={small}>
                    <p className="text-3xl font-semibold">{big}</p>
                    <p className="text-sm text-white/50">{small}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 — 저작권 */}
            <p className="text-sm text-white/50">
              © 2026 JARINARE ALL rights reserved
            </p>
          </div>

          {/* 오른쪽 패널 */}
          <div className="relative flex items-center justify-center bg-gray-50">
            {/* 로그인 카드 */}
            <div
              className={`flex h-[620px] w-[520px] flex-col justify-between px-10 py-10 ${formOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-gray-900">로그인</h2>
                <p className="text-xs text-gray-400">계정에 로그인하세요</p>
              </div>
              <div className="flex flex-col gap-3">
                <LoginList />
                <div className="before:content-[' '] after:content-[' '] flex w-full items-center gap-3 text-xs text-mediumGray before:h-[1px] before:flex-grow before:bg-gray-200 after:h-[1px] after:flex-grow after:bg-gray-200">
                  또는
                </div>
                <SocialLoginList />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-mediumGray">
                  회원이 아니신가요?
                </span>
                <Link
                  className="flex h-12 w-full items-center justify-center rounded-md border border-lightGray bg-white text-base font-bold text-blue shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
                  to={'/auth/signup'}
                >
                  회원가입
                </Link>
              </div>
            </div>

            {/* 이메일/비밀번호 모달 */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${formOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <div className="h-[620px] w-[520px]">
                <Modal />
              </div>
            </div>
          </div>
        </div>
      </FormProvider>

      {/* 모바일 버전 */}
      <FormProvider {...mobileMethod}>
        <div className="flex h-screen w-full items-center justify-center lg:hidden">
          <div className="relative flex h-[667px] w-[375px] flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
            <BackWardPageButton title="로그인" step="Step 1 of 2" />
            <div className="mt-[35px]">
              <LoginList />
            </div>
            <div className="before:content-[' '] after:content-[' '] mb-[30px] mt-[30px] flex w-full items-center gap-[10px] text-xs text-mediumGray before:h-[1px] before:flex-grow before:bg-mediumGray after:h-[1px] after:flex-grow after:bg-mediumGray">
              또는
            </div>
            <SocialLoginList />
            <div className="mt-[30px] flex w-full flex-col items-center gap-y-2">
              <span className="text-sm text-mediumGray">
                회원이 아니신가요?
              </span>
              <Link
                className="relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-white text-base font-bold text-blue shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
                to={'/auth/signup'}
              >
                회원가입
              </Link>
            </div>
            <div className="absolute inset-0">
              <Modal />
            </div>
          </div>
        </div>
      </FormProvider>
    </>
  );
};

export default LoginPage;

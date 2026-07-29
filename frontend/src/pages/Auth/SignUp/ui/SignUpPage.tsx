import { SignUp } from '@/features/Auth/SignUp/model/SignUpSchema';
import EmailForm from '@/features/Auth/SignUp/ui/EmailForm';
import Modal from '@/widgets/Auth/SignUp/ui/Modal';
import PCModal from '@/widgets/Auth/SignUp/ui/PCModal';
import SignUpStageLine from '@/widgets/Auth/SignUp/ui/SignUpStageLine';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/AuthStore';
import { FormProvider } from 'react-hook-form';
import { useSignUpPage } from '../hooks/useSignUpPage';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SignUpPage = () => {
  const { isShow, modalType, resetModal } = useModalStore();
  const { method: pcMethod } = SignUp();
  const { method: mobileMethod } = SignUp();
  const { mobileHandleNextClick, isChecking } = useSignUpPage(mobileMethod);

  useEffect(() => {
    resetModal();
  }, []);

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
            <div className="absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/10" />
            <Link
              to="/"
              className="text-2xl font-semibold tracking-[0.1em] text-white transition-opacity hover:opacity-80"
            >
              JARINARE
            </Link>
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
            <p className="text-sm text-white/50">
              © 2026 JARINARE ALL rights reserved
            </p>
          </div>

          {/* 오른쪽 패널 */}
          <div className="flex items-center justify-center bg-gray-50">
            <div className="h-[620px] w-[520px]">
              <PCModal />
            </div>
          </div>
        </div>
      </FormProvider>

      {/* 모바일 버전 */}
      <FormProvider {...mobileMethod}>
        <div className="flex h-screen w-full items-center justify-center lg:hidden">
          <div className="flex h-[667px] w-[375px] flex-col items-center bg-lightestGray pl-[38px] pr-[37px]">
            <BackWardPageButton title="회원가입" step="Step 1 of 4" />
            <EmailForm />
            <SignUpStageLine stage={1} />
            <div className="mb-[45px] flex flex-col">
              <button
                type="button"
                onClick={mobileHandleNextClick}
                disabled={isChecking}
                className="relative flex h-12 w-[300px] items-center justify-center rounded-md border border-lightGray bg-blue text-base font-bold text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95 disabled:bg-lightBlueImpossible disabled:opacity-50"
              >
                {isChecking ? '확인 중...' : '다음'}
              </button>
            </div>
            {isShow == false || modalType == undefined ? null : <Modal />}
          </div>
        </div>
      </FormProvider>
    </>
  );
};

export default SignUpPage;

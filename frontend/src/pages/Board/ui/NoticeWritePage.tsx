/**
 * @role: pages — 공지사항 작성 페이지
 * @rule: 레이아웃·조합만 담당, admin 접근 가드 포함
 */
import backward from '@/assets/icons/backward.png';
import { useNoticeHandler } from '@/features/Board/hooks/useNoticeHandler';
import NoticeForm from '@/widgets/Board/ui/NoticeForm';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import PCWriteForm from '@/widgets/Board/ui/PCWriteForm';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import PCLoginRequiredPage from '@/widgets/layouts/ui/PCLoginRequiredPage';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const LoginRequired = ({ onLogin }: { onLogin: () => void }) => (
  <>
    <div className="hidden w-full lg:block">
      <PCLoginRequiredPage
        description="로그인 후 글을 작성할 수 있어요"
        onLogin={onLogin}
      />
    </div>
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 lg:hidden">
      <LoginRequiredBlock
        description="로그인 후 글을 작성할 수 있어요"
        onLogin={onLogin}
      />
    </div>
  </>
);

const NoticeWirtePage = () => {
  const navigate = useNavigate();
  const notice = useNoticeHandler({ navigateTo: '/board/noticelist' });
  const { user, isLoading } = useCurrentUser();

  if (!localStorage.getItem(ACCESS_TOKEN_KEY))
    return <LoginRequired onLogin={() => navigate('/auth/login')} />;

  if (isLoading) return null;

  if (!user || user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    navigate('/board/noticelist', { replace: true });
    return null;
  }

  return (
    <>
      {/* PC */}
      <div className="hidden w-full lg:block">
        <PCWriteForm {...notice} categoryLabel={notice.isEditMode ? '공지사항 수정' : '공지'} backLabel="공지사항" />
      </div>

      {/* 모바일 */}
      <div className="flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        <div className="flex w-full flex-col px-4 pl-[28px] pr-[27px]">
          <div className="mt-[30px] flex items-center gap-4">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <h1 className="text-lg font-bold">{notice.isEditMode ? '공지사항 수정' : '공지사항 작성'}</h1>
          </div>
          <NoticeForm {...notice} />
        </div>
        {notice.loading ? <LoadingScreen /> : null}
      </div>
    </>
  );
};

export default NoticeWirtePage;

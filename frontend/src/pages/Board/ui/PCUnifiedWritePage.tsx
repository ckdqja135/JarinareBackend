/**
 * @role: pages — PC 통합 글 작성 페이지 (분류 선택 가능)
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useState, useCallback } from 'react';
import { useBaordHandler } from '@/features/Board/hooks/useBoardHandler';
import { useNoticeHandler } from '@/features/Board/hooks/useNoticeHandler';
import { useEventHandler } from '@/features/Board/hooks/useEventHandler';
import PCWriteForm from '@/widgets/Board/ui/PCWriteForm';
import LoadingScreen from '@/widgets/Board/ui/LoadingScreen';
import { WriteCategory } from '@/widgets/Board/types/boardWidgetType';
import { sendBoardPostNotifications } from '@/features/Follow/api/boardPostNotification';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import PCLoginRequiredPage from '@/widgets/layouts/ui/PCLoginRequiredPage';

const CATEGORY_LABEL: Record<WriteCategory, string> = {
  board: '자유',
  notice: '공지',
  event: '이벤트',
};

const PCUnifiedWritePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useCurrentUser();
  const [category, setCategory] = useState<WriteCategory>('board');

  const handleAfterBoardCreate = useCallback(
    (posterUid: string, posterName: string, postDocId: string) => {
      sendBoardPostNotifications(posterUid, posterName, postDocId).catch(
        console.error,
      );
    },
    [],
  );

  const board = useBaordHandler(
    category === 'board'
      ? { onAfterCreate: handleAfterBoardCreate }
      : undefined,
  );
  const notice = useNoticeHandler();
  const event = useEventHandler();

  if (!localStorage.getItem(ACCESS_TOKEN_KEY))
    return (
      <PCLoginRequiredPage
        description="로그인 후 글을 작성할 수 있어요"
        onLogin={() => navigate('/auth/login')}
      />
    );

  if (userLoading) return null;

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const activeHandler =
    category === 'board' ? board : category === 'notice' ? notice : event;

  const isLoading = activeHandler.loading;

  return (
    <>
      <PCWriteForm
        {...activeHandler}
        categoryLabel={CATEGORY_LABEL[category]}
        backLabel="게시판"
        categorySelectable={isAdmin}
        selectedCategory={category}
        onCategoryChange={isAdmin ? setCategory : undefined}
      />
      {isLoading && <LoadingScreen />}
    </>
  );
};

export default PCUnifiedWritePage;

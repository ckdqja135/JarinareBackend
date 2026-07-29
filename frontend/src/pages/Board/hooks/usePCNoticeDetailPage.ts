/**
 * @role: pages — PC 공지사항 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { auth } from '@/shared/firebase/firebase';

export const usePCNoticeDetailPage = (notice: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentNotice = notice ?? null;
  const postDocId = currentNotice?.id ?? '';

  const { deletePost } = useDeletePost();
  const { viewCount } = useViewCount('notice', postDocId);

  const currentUid = auth.currentUser?.uid;
  const isOwner =
    !!currentUid &&
    !!currentNotice?.authorUid &&
    currentNotice.authorUid === currentUid;

  const handleDelete = async () => {
    if (!currentNotice) return;
    await deletePost('notice', currentNotice.id);
    navigate(-1);
  };

  const handleEdit = () => {
    if (!currentNotice) return;
    navigate('/board/notice', { state: { editPost: currentNotice } });
  };

  return {
    currentNotice,
    isOwner,
    viewCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleEdit,
  };
};

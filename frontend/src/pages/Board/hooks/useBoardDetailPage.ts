/**
 * @role: pages — 자유게시판 상세 페이지 (모바일) 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { auth } from '@/shared/firebase/firebase';

export const useBoardDetailPage = (post: BoardPost | undefined) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPost = post ?? null;
  const postDocId = currentPost?.id ?? '';

  const postItems = useMemo(
    () => (currentPost ? [currentPost] : []),
    [currentPost?.id],
  );
  const { likedMap, likesMap, handleClickLike } = useLikeBoard(postItems);
  const { deletePost } = useDeletePost();

  const currentUid = auth.currentUser?.uid;
  const isOwner =
    !!currentUid && !!currentPost?.authorUid && currentPost.authorUid === currentUid;
  const isLiked = likedMap[currentPost?.id ?? ''] ?? false;
  const likesCount = likesMap[currentPost?.id ?? ''] ?? currentPost?.likes ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost('board', currentPost.id);
    navigate(-1);
  };

  const handleLike = () => {
    if (!currentPost) return;
    handleClickLike(currentPost.id);
  };

  return {
    currentPost,
    postDocId,
    isOwner,
    isLiked,
    likesCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleLike,
  };
};

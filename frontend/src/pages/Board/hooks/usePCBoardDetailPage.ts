/**
 * @role: pages — PC 자유게시판 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { useLikeBoard } from '@/features/Board/hooks/useLikeBoard';
import { useViewCount } from '@/features/Board/hooks/useViewCount';
import { useFollow } from '@/features/Follow/hooks/useFollow';
import { auth } from '@/shared/firebase/firebase';

export const usePCBoardDetailPage = (post: BoardPost | undefined) => {
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
  const { viewCount } = useViewCount('board', postDocId);

  const currentUid = auth.currentUser?.uid;
  const authorUid = currentPost?.authorUid ?? '';
  const isOwner = !!currentUid && !!authorUid && authorUid === currentUid;
  const {
    isFollowing,
    loading: followLoading,
    toggleFollow,
  } = useFollow(authorUid, currentPost?.author ?? '');
  const isLiked = likedMap[currentPost?.id ?? ''] ?? false;
  const likesCount = likesMap[currentPost?.id ?? ''] ?? currentPost?.likes ?? 0;

  const handleDelete = async () => {
    if (!currentPost) return;
    await deletePost('board', currentPost.id);
    navigate(-1);
  };

  const handleEdit = () => {
    if (!currentPost) return;
    navigate('/board/board', { state: { editPost: currentPost } });
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
    viewCount,
    menuOpen,
    setMenuOpen,
    handleDelete,
    handleEdit,
    handleLike,
    isFollowing,
    followLoading,
    toggleFollow,
  };
};

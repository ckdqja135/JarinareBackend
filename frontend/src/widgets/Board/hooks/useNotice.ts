/**
 * @role: widgets — 공지사항 목록 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { BoardPost } from '@/entities/Board/types/boardType';
import { useNoticePageNation } from '@/features/Board/hooks/useNoticePagination';
import { useLikeNoitce } from '@/features/Board/hooks/useLikeNotice';
import { useDeletePost } from '@/features/Board/hooks/useDeletePost';
import { auth } from '@/shared/firebase/firebase';

type SortOrder = 'newest' | 'oldest';

export const useNotice = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { ref, items, isFetching } = useNoticePageNation(
    searchQuery,
    sortOrder,
  );
  const { likedMap, likesMap, handleClickLike } = useLikeNoitce(items);
  const { deletePost } = useDeletePost();
  const currentUid = auth.currentUser?.uid;

  const displayedItems = items
    .filter((p) => !deletedIds.has(p.id))
    .map((p) => ({ ...p }) as BoardPost);

  const handleDelete = async (post: BoardPost) => {
    await deletePost('notice', post.id);
    setDeletedIds((prev) => new Set(prev).add(post.id));
    setMenuOpenId(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    filterOpen,
    setFilterOpen,
    menuOpenId,
    setMenuOpenId,
    ref,
    items,
    isFetching,
    likedMap,
    likesMap,
    handleClickLike,
    displayedItems,
    handleDelete,
    currentUid,
  };
};

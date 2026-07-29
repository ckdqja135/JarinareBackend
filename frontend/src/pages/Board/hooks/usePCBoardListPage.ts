/**
 * @role: pages — PC 자유게시판 목록 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useGetBoard } from '@/features/Board/hooks/useGetBoard';
import { BoardSortOrder } from '../types/boardPageType';

export const usePCBoardListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<BoardSortOrder>('newest');
  const { boardData } = useGetBoard();

  const totalCount = boardData.length;

  return {
    searchQuery,
    setSearchQuery,
    totalCount,
    sortOrder,
    setSortOrder,
  };
};

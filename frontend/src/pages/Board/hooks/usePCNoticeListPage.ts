/**
 * @role: pages — PC 공지사항 목록 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useGetNotice } from '@/features/Board/hooks/useGetNotice';
import { useViewCounts } from '@/features/Board/hooks/useViewCounts';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const PAGE_SIZE = 10;

export const usePCNoticeListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(0);

  const { noticeData, isLoaded } = useGetNotice();

  const { user } = useCurrentUser();
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const processedData = useMemo(() => {
    return [...noticeData].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt,
    );
  }, [noticeData, sortOrder]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return processedData;
    return processedData.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q),
    );
  }, [processedData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagedData = filteredData.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  const visiblePages = useMemo(() => {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    const end = Math.min(totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const { viewsMap } = useViewCounts(pagedData);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(0);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setCurrentPage(0);
  };

  const formatDate = (createdAt: number) =>
    new Date(createdAt * 1000)
      .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/')
      .replace('.', '');

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    sortOrder,
    setSortOrder: handleSortChange,
    currentPage,
    setCurrentPage,
    pagedData,
    filteredData,
    totalPages,
    visiblePages,
    isLoading: !isLoaded,
    viewsMap,
    isAdmin,
    formatDate,
  };
};

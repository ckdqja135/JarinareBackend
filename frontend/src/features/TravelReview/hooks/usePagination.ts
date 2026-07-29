/**
 * @role: features — 페이지네이션 상태 관리 훅
 * @rule: 상태·계산만 담당, 렌더링 금지
 */
import { useState } from 'react';
import type { PaginationItem } from '../types/paginationType';

export const usePagination = (items: PaginationItem[], pageSize: number) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const goPrev = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (n: number) => setPage(Math.min(Math.max(n, 1), totalPages));
  const reset = () => setPage(1);

  return { paged, page: safePage, totalPages, goNext, goPrev, goToPage, reset };
};

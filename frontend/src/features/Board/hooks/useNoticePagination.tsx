/**
 * @role: features — 공지사항 게시글 페이지네이션 훅
 * @rule: 페이지 상태·정렬·검색 로직만 담당
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetNotice } from './useGetNotice';
import { BoardPost } from '@/entities/Board/types/boardType';

type SortOrder = 'newest' | 'oldest';

export const useNoticePageNation = (
  searchQuery: string = '',
  sortOrder: SortOrder = 'newest',
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { noticeData } = useGetNotice();

  const [noticePage, setNoticePage] = useState(0);
  const [items, setItems] = useState<BoardPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  const PAGE_SIZE = 3;

  // 검색 + 정렬 적용
  const filteredData = useMemo(() => {
    let data = noticeData;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      data = data.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.content?.toLowerCase().includes(q) ||
          d.author?.toLowerCase().includes(q),
      );
    }

    return [...data].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt,
    );
  }, [noticeData, searchQuery, sortOrder]);

  // 검색/정렬 변경 시 페이지 리셋
  useEffect(() => {
    if (noticeData.length === 0) return;

    const firstPage = filteredData.slice(0, PAGE_SIZE);
    const nextPage = filteredData.slice(PAGE_SIZE, PAGE_SIZE * 2);

    setItems(firstPage);
    setNoticePage(0);
    setHasMore(nextPage.length > 0);
    setIsFetching(false);
  }, [filteredData]);

  const fetchMoreItems = () => {
    const nextPage = noticePage + 1;
    const nextItems = filteredData.slice(
      nextPage * PAGE_SIZE,
      (nextPage + 1) * PAGE_SIZE,
    );

    if (nextItems.length === 0) {
      setHasMore(false);
      return;
    }

    setItems((prev) => [...prev, ...nextItems]);
    setNoticePage(nextPage);

    if ((nextPage + 1) * PAGE_SIZE >= filteredData.length) {
      setHasMore(false);
    }
  };

  // 스크롤 감지
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreItems();
        }
      },
      { threshold: 0.01, rootMargin: '200px' },
    );

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, noticePage, filteredData]);

  return { ref, items, isFetching };
};

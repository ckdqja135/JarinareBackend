/**
 * @role: features — 여행지 후기 검색 (역 이름 + 게시물 내용)
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useState } from 'react';

export interface SearchResultItem {
  city: string;
  reviewId: string;
  title: string;
  content: string;
  author: string;
  rating: number;
  createdAt: number;
}

type ReviewListItem = {
  id: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  createdAt: number;
};

export const useSearchTravelReviews = (query: string, _cities: string[]) => {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    backendClient
      .get<{ data: ReviewListItem[] }>('/api/travel-reviews', {
        params: { keyword: query.trim(), size: 200 },
      })
      .then(({ data }) => {
        setResults(
          data.data.map((r) => ({
            city: '',
            reviewId: r.id,
            title: r.title,
            content: r.content,
            author: r.author,
            rating: r.rating,
            createdAt: r.createdAt,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setIsSearching(false));
  }, [query]);

  return { results, isSearching };
};

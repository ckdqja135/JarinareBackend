/**
 * @role: features — 조회수 상위 게시물 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { useEffect, useState } from 'react';
import { fetchTopViewedPostsApi } from '../api/topViewedPostApi';

export interface TopPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'board' | 'event' | 'notice';
  viewCount: number;
}

const TOP_COUNT = 5;

export const useTopViewedPost = () => {
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);

  useEffect(() => {
    fetchTopViewedPostsApi(TOP_COUNT).then(setTopPosts);
  }, []);

  return { topPosts };
};

/**
 * @role: features/api — 조회수 상위 게시물 조회
 * @rule: 백엔드 /api/boards/:boardType/posts?sort=views 에서 조회
 */
import { backendClient } from '@/shared/api/backendClient';
import { TopPost } from '../hooks/useTopViewedPost';

export const fetchTopViewedPostsApi = async (
  topCount: number,
): Promise<TopPost[]> => {
  const [boardRes, eventRes, noticeRes] = await Promise.all([
    backendClient.get('/api/boards/board/posts', {
      params: { sort: 'views', size: topCount },
    }),
    backendClient.get('/api/boards/event/posts', {
      params: { sort: 'views', size: topCount },
    }),
    backendClient.get('/api/boards/notice/posts', {
      params: { sort: 'views', size: topCount },
    }),
  ]);

  const all: TopPost[] = [
    ...(boardRes.data.data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      author: p.author,
      category: 'board' as const,
      viewCount: p.views,
    })),
    ...(eventRes.data.data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      author: p.author,
      category: 'event' as const,
      viewCount: p.views,
    })),
    ...(noticeRes.data.data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      author: p.author,
      category: 'notice' as const,
      viewCount: p.views,
    })),
  ];

  return all.sort((a, b) => b.viewCount - a.viewCount).slice(0, topCount);
};

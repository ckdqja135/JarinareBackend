/**
 * @role: features/api — 게시판 카테고리별 최신 게시물 조회
 * @rule: 백엔드 /api/boards/:boardType/posts?sort=latest&size=n 에서 조회
 */
import { backendClient } from '@/shared/api/backendClient';
import { LatestPost } from '../types/boardType';

export const fetchLatestPostsApi = async (
  category: string,
  n: number,
): Promise<(LatestPost | null)[]> => {
  const { data } = await backendClient.get(`/api/boards/${category}/posts`, {
    params: { sort: 'latest', size: n },
  });

  const posts: LatestPost[] = (data.data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    author: p.author,
    viewCount: p.views,
    createdAt: p.createdAt,
    commentCount: p.commentCount ?? 0,
  }));

  return Array.from({ length: n }, (_, i) => posts[i] ?? null);
};

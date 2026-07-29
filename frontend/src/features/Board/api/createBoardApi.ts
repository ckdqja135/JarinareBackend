/**
 * @role: features — 자유게시판 게시글 생성 API
 * @rule: 백엔드 /api/boards/board/posts 에 POST (uid·author는 토큰에서 추출)
 */
import { backendClient } from '@/shared/api/backendClient';

export const createBoardApi = async (
  title: string,
  content: string,
  tags: string[] = [],
  imageUrl?: string | null,
): Promise<string | undefined> => {
  try {
    const { data } = await backendClient.post('/api/boards/board/posts', {
      boardType: 'board',
      title,
      content,
      tags,
      imageUrl: imageUrl ?? null,
    });
    return data.id;
  } catch (error) {
    console.error('[createBoardApi]', error);
  }
};

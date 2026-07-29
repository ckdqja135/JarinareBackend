/**
 * @role: features — 이벤트 게시글 생성 API
 * @rule: 백엔드 /api/boards/event/posts 에 POST (uid·author는 토큰에서 추출)
 */
import { backendClient } from '@/shared/api/backendClient';

export const createEventApi = async (
  title: string,
  content: string,
  imageUrl?: string | null,
): Promise<string | undefined> => {
  try {
    const { data } = await backendClient.post('/api/boards/event/posts', {
      boardType: 'event',
      title,
      content,
      imageUrl: imageUrl ?? null,
    });
    return data.id;
  } catch (error) {
    console.error('[createEventApi]', error);
  }
};

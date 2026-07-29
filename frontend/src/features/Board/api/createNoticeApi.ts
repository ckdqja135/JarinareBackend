/**
 * @role: features — 공지사항 게시글 생성 API
 * @rule: 백엔드 /api/boards/notice/posts 에 POST (uid·author는 토큰에서 추출)
 */
import { backendClient } from '@/shared/api/backendClient';

export const createNoticeApi = async (
  title: string,
  content: string,
  imageUrl?: string | null,
): Promise<string | undefined> => {
  try {
    const { data } = await backendClient.post('/api/boards/notice/posts', {
      boardType: 'notice',
      title,
      content,
      imageUrl: imageUrl ?? null,
    });
    return data.id;
  } catch (error) {
    console.error('[createNoticeApi]', error);
  }
};

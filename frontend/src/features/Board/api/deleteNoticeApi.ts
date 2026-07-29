/**
 * @role: features/api — 공지사항 삭제
 * @rule: 백엔드 /api/boards/notice/posts/:noticeId 에 DELETE
 */
import { backendClient } from '@/shared/api/backendClient';

export const deleteNoticeApi = async (noticeId: string): Promise<void> => {
  await backendClient.delete(`/api/boards/notice/posts/${noticeId}`);
};

/**
 * @role: features/api — 게시판 카테고리별 전체 게시물 수 조회
 * @rule: 백엔드 /api/boards/:boardType/posts?size=1 의 total 필드 활용
 */
import { backendClient } from '@/shared/api/backendClient';

export const getBoardCountsApi = async (): Promise<{
  notice: number;
  event: number;
  board: number;
}> => {
  const [noticeRes, eventRes, boardRes] = await Promise.all([
    backendClient.get('/api/boards/notice/posts', { params: { size: 1 } }),
    backendClient.get('/api/boards/event/posts', { params: { size: 1 } }),
    backendClient.get('/api/boards/board/posts', { params: { size: 1 } }),
  ]);
  return {
    notice: noticeRes.data.total,
    event: eventRes.data.total,
    board: boardRes.data.total,
  };
};

/**
 * @role: features/api — 게시판 마지막 방문 시각 조회·갱신
 * @rule: 백엔드 /api/users/me/board-seen 에서 조회·갱신
 */
import { backendClient } from '@/shared/api/backendClient';

interface SeenData {
  notice: number;
  event: number;
  board: number;
}

export const getBoardSeenApi = async (): Promise<SeenData> => {
  const { data } = await backendClient.get('/api/users/me/board-seen');
  // 백엔드 반환값(ms)을 초 단위로 변환하여 post.createdAt(초)과 비교 가능하게 함
  return {
    notice: Math.floor(data.notice / 1000),
    event: Math.floor(data.event / 1000),
    board: Math.floor(data.board / 1000),
  };
};

export const updateBoardSeenApi = async (
  _uid: string,
  category: 'notice' | 'event' | 'board',
  nowSeconds: number,
): Promise<void> => {
  await backendClient.patch(`/api/users/me/board-seen/${category}`, {
    seenAt: nowSeconds * 1000,
  });
};

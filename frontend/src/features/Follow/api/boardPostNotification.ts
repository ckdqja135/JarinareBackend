/**
 * @role: features — 게시글 작성 시 팔로우 관련 알림 전송
 * @rule: 백엔드가 자동으로 알림 발송하므로 클라이언트에서 별도 호출 불필요
 */

// 백엔드 boards.service.ts가 게시글 생성 시 following_post / top_follower_post 알림을 자동 발송합니다.
export const sendBoardPostNotifications = async (
  _posterUid: string,
  _posterName: string,
  _postDocId?: string,
) => {};

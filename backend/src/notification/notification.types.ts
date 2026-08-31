// @role: features/notification
// @rule: 알림 타입 정의와 DB row -> 전송 DTO 변환만 담당
export const NOTIFICATION_TYPES = [
  "board_like",
  "comment",
  "reply",
  "comment_like",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** users 테이블의 알림 수신 설정 */
export interface NotificationSettings {
  notifiChange: boolean;
  notifResponse: boolean;
}

/** notifications 테이블 row 중 전달에 필요한 필드만 추린 구조 */
export interface NotificationRow {
  id: bigint;
  userIdx: bigint;
  type: string;
  isRead: boolean;
  payload: unknown;
  createdAt: Date;
}

/** 클라이언트로 나가는 알림 형태 (SSE / REST 공통) */
export interface NotificationDto {
  id: number;
  type: string;
  isRead: boolean;
  createdAt: string;
  payload: unknown;
}

export function toNotificationDto(row: NotificationRow): NotificationDto {
  return {
    id: Number(row.id),
    type: row.type,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
    payload: row.payload,
  };
}

/**
 * 수신자의 설정에 따라 알림을 만들지 결정한다.
 * - notifResponse: 내 글·댓글에 달린 반응(댓글/대댓글/좋아요) 알림
 * - notifiChange:  좌석 변경 알림 (해당 타입이 생기면 여기에 매핑한다)
 */
export function shouldNotify(
  type: NotificationType,
  settings: NotificationSettings,
): boolean {
  switch (type) {
    case "board_like":
    case "comment":
    case "reply":
    case "comment_like":
      return settings.notifResponse;
    default:
      return true;
  }
}

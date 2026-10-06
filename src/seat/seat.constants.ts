// @role: features/seat
// @rule: 좌석 도메인의 상수·상태값만 담당

/** 좌석 선점 유지 시간 — 영화 예매에서 좌석을 고른 뒤 결제까지 잡아 두는 시간 */
export const HOLD_TTL_MS = 7 * 60_000;

/** 좌석 교환 신청의 응답 대기 시간 — 프론트 useRequestTimer 의 TIMEOUT_MS 와 같다 */
export const CHANGE_REQUEST_TTL_MS = 60_000;

/**
 * 한 번에 선점·예매·변경할 수 있는 좌석 수.
 * 기존 앱은 인원 상한이 없고 호차 잔여석(24석)만 한계였으므로 같은 값을 둔다.
 */
export const MAX_SEATS_PER_ORDER = 24;

/**
 * 활성 예약을 나타내는 canceledAt sentinel.
 * schema.prisma 의 Reservation 주석 참고 — NULL 이면 UNIQUE 가 걸리지 않아서 쓴다.
 * DB 기본값과 무관하게 앱이 항상 이 값을 직접 넣고 비교한다.
 */
export const ACTIVE = new Date(0);

/** 열차 종류별 배치가 없을 때 쓰는 기본 배치 */
export const DEFAULT_LAYOUT = "DEFAULT";

/** 좌석 현황에서 각 좌석이 가질 수 있는 상태 */
export const SeatState = {
  AVAILABLE: "AVAILABLE",
  HELD: "HELD", // 다른 사람이 결제 중
  HELD_BY_ME: "HELD_BY_ME",
  RESERVED: "RESERVED", // 다른 사람이 예매함
  MINE: "MINE", // 내가 예매함
} as const;
export type SeatState = (typeof SeatState)[keyof typeof SeatState];

export const ChangeRequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
} as const;
export type ChangeRequestStatus =
  (typeof ChangeRequestStatus)[keyof typeof ChangeRequestStatus];

export const PassengerType = { ADULT: "ADULT", CHILD: "CHILD" } as const;
export type PassengerType = (typeof PassengerType)[keyof typeof PassengerType];

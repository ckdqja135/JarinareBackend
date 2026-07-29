/**
 * 사전 캐싱 대상 고정 노선 목록.
 *
 * 스케줄러(train-time-sync.service)는 이 목록의 각 노선에 대해 1주일치 열차 시간표를
 * 외부 API 에서 조회하여 stations_times 에 저장한다. 출발역-도착역 조합이 고정이라는
 * 전제 하에 여기서 관리한다. (양방향이 필요하면 두 방향 모두 항목으로 추가한다.)
 *
 * 역 ID(depPlaceId / arrPlaceId)는 stations 테이블의 nodeid 와 동일한 공공데이터 역 ID 이다.
 * (예: 서울 NAT010000, 부산 NAT011668 — trains DTO 예시와 동일)
 *
 * ⚠️ 아키텍트 작업: 실제 서비스 대상 노선을 아래에 채운다.
 *    - 잘못된 역 ID 는 해당 노선만 조용히 실패(로그 경고)하므로, 추가 시 nodeid 를 검증한다.
 *    - depPlaceId 와 arrPlaceId 가 같은 항목은 스케줄러가 건너뛴다.
 */
export interface TrainRoute {
  /** 출발역 ID (stations.nodeid) */
  depPlaceId: string;
  /** 도착역 ID (stations.nodeid) */
  arrPlaceId: string;
  /** 로그/디버깅용 사람이 읽는 라벨 (선택) */
  label?: string;
}

export const TRAIN_ROUTES: readonly TrainRoute[] = [
  // 검증된 예시 (trains DTO 예시와 동일한 역 ID)
  { depPlaceId: 'NAT010000', arrPlaceId: 'NAT011668', label: '서울→부산' },
  { depPlaceId: 'NAT011668', arrPlaceId: 'NAT010000', label: '부산→서울' },
  // TODO(아키텍트): 이하 실제 대상 노선 추가
];

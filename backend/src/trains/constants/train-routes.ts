/**
 * 사전 캐싱 대상 고정 노선 목록.
 *
 * 스케줄러(train-time-sync.service)는 이 목록의 각 노선에 대해 1주일치 열차 시간표를
 * 외부 API 에서 조회하여 stations_times 에 저장한다. 출발역-도착역 조합이 고정이라는
 * 전제 하에 여기서 관리한다. (양방향이 필요하면 두 방향 모두 항목으로 추가한다.)
 *
 * 역 ID(depPlaceId / arrPlaceId)는 stations 테이블의 nodeid 와 동일한 공공데이터 역 ID 이다.
 * (예: 서울 NAT010000, 부산 NAT014445)
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
  // 서울(NAT010000) ↔ 각 도시
  { depPlaceId: "NAT010000", arrPlaceId: "NAT014445", label: "서울→부산" },
  { depPlaceId: "NAT014445", arrPlaceId: "NAT010000", label: "부산→서울" },
  { depPlaceId: "NAT010000", arrPlaceId: "NATH13421", label: "서울→경주" },
  { depPlaceId: "NATH13421", arrPlaceId: "NAT010000", label: "경주→서울" },
  { depPlaceId: "NAT010000", arrPlaceId: "NAT040257", label: "서울→전주" },
  { depPlaceId: "NAT040257", arrPlaceId: "NAT010000", label: "전주→서울" },
  { depPlaceId: "NAT010000", arrPlaceId: "NAT601936", label: "서울→강릉" },
  { depPlaceId: "NAT601936", arrPlaceId: "NAT010000", label: "강릉→서울" },
  { depPlaceId: "NAT010000", arrPlaceId: "NAT041993", label: "서울→여수EXPO" },
  { depPlaceId: "NAT041993", arrPlaceId: "NAT010000", label: "여수EXPO→서울" },
  { depPlaceId: "NAT010000", arrPlaceId: "NAT140873", label: "서울→춘천" },
  { depPlaceId: "NAT140873", arrPlaceId: "NAT010000", label: "춘천→서울" },
  // 부산(NAT014445) ↔ 각 도시
  { depPlaceId: "NAT014445", arrPlaceId: "NATH13421", label: "부산→경주" },
  { depPlaceId: "NATH13421", arrPlaceId: "NAT014445", label: "경주→부산" },
  { depPlaceId: "NAT014445", arrPlaceId: "NAT040257", label: "부산→전주" },
  { depPlaceId: "NAT040257", arrPlaceId: "NAT014445", label: "전주→부산" },
  { depPlaceId: "NAT014445", arrPlaceId: "NAT601936", label: "부산→강릉" },
  { depPlaceId: "NAT601936", arrPlaceId: "NAT014445", label: "강릉→부산" },
  { depPlaceId: "NAT014445", arrPlaceId: "NAT041993", label: "부산→여수EXPO" },
  { depPlaceId: "NAT041993", arrPlaceId: "NAT014445", label: "여수EXPO→부산" },
  { depPlaceId: "NAT014445", arrPlaceId: "NAT140873", label: "부산→춘천" },
  { depPlaceId: "NAT140873", arrPlaceId: "NAT014445", label: "춘천→부산" },
  // 경주(NATH13421) ↔ 각 도시
  { depPlaceId: "NATH13421", arrPlaceId: "NAT040257", label: "경주→전주" },
  { depPlaceId: "NAT040257", arrPlaceId: "NATH13421", label: "전주→경주" },
  { depPlaceId: "NATH13421", arrPlaceId: "NAT601936", label: "경주→강릉" },
  { depPlaceId: "NAT601936", arrPlaceId: "NATH13421", label: "강릉→경주" },
  { depPlaceId: "NATH13421", arrPlaceId: "NAT041993", label: "경주→여수EXPO" },
  { depPlaceId: "NAT041993", arrPlaceId: "NATH13421", label: "여수EXPO→경주" },
  { depPlaceId: "NATH13421", arrPlaceId: "NAT140873", label: "경주→춘천" },
  { depPlaceId: "NAT140873", arrPlaceId: "NATH13421", label: "춘천→경주" },
  // 전주(NAT040257) ↔ 각 도시
  { depPlaceId: "NAT040257", arrPlaceId: "NAT601936", label: "전주→강릉" },
  { depPlaceId: "NAT601936", arrPlaceId: "NAT040257", label: "강릉→전주" },
  { depPlaceId: "NAT040257", arrPlaceId: "NAT041993", label: "전주→여수EXPO" },
  { depPlaceId: "NAT041993", arrPlaceId: "NAT040257", label: "여수EXPO→전주" },
  { depPlaceId: "NAT040257", arrPlaceId: "NAT140873", label: "전주→춘천" },
  { depPlaceId: "NAT140873", arrPlaceId: "NAT040257", label: "춘천→전주" },
  // 강릉(NAT601936) ↔ 각 도시
  { depPlaceId: "NAT601936", arrPlaceId: "NAT041993", label: "강릉→여수EXPO" },
  { depPlaceId: "NAT041993", arrPlaceId: "NAT601936", label: "여수EXPO→강릉" },
  { depPlaceId: "NAT601936", arrPlaceId: "NAT140873", label: "강릉→춘천" },
  { depPlaceId: "NAT140873", arrPlaceId: "NAT601936", label: "춘천→강릉" },
  // 여수EXPO(NAT041993) ↔ 춘천
  { depPlaceId: "NAT041993", arrPlaceId: "NAT140873", label: "여수EXPO→춘천" },
  { depPlaceId: "NAT140873", arrPlaceId: "NAT041993", label: "춘천→여수EXPO" },
];

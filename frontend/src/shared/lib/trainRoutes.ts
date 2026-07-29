// 열차 타입 → 노선명 → 정차역
export const TRAIN_ROUTES: Record<string, Record<string, string[]>> = {
  KTX: {
    경부선: [
      '서울',
      '광명',
      '천안아산',
      '오송',
      '대전',
      '김천구미',
      '동대구',
      '경주',
      '울산',
      '부산',
    ],
    호남선: [
      '용산',
      '광명',
      '천안아산',
      '오송',
      '공주',
      '익산',
      '정읍',
      '광주송정',
      '나주',
      '목포',
    ],
    전라선: [
      '용산',
      '광명',
      '천안아산',
      '오송',
      '익산',
      '전주',
      '남원',
      '곡성',
      '구례구',
      '순천',
      '여천',
      '여수EXPO',
    ],
    강릉선: [
      '서울',
      '청량리',
      '상봉',
      '양평',
      '만종',
      '횡성',
      '둔내',
      '평창',
      '진부',
      '강릉',
    ],
    중앙선: [
      '청량리',
      '양평',
      '서원주',
      '원주',
      '제천',
      '단양',
      '풍기',
      '영주',
      '안동',
    ],
  },
  'KTX-산천A': {
    경부선: [
      '서울',
      '광명',
      '천안아산',
      '오송',
      '대전',
      '김천구미',
      '동대구',
      '부산',
    ],
    호남선: [
      '용산',
      '광명',
      '천안아산',
      '오송',
      '공주',
      '익산',
      '정읍',
      '광주송정',
      '목포',
    ],
    전라선: ['용산', '익산', '전주', '순천', '여수EXPO'],
    동해선: ['서울', '동대구', '포항'],
  },
  'KTX-산천B': {
    경부선: [
      '서울',
      '광명',
      '천안아산',
      '오송',
      '대전',
      '김천구미',
      '동대구',
      '부산',
    ],
    호남선: [
      '용산',
      '광명',
      '천안아산',
      '오송',
      '공주',
      '익산',
      '정읍',
      '광주송정',
      '목포',
    ],
    전라선: ['용산', '익산', '전주', '순천', '여수EXPO'],
    동해선: ['서울', '동대구', '포항'],
  },
  'KTX-청룡': {
    경부고속선: ['서울', '대전', '동대구', '부산'],
    호남고속선: ['용산', '익산', '광주송정', '목포'],
  },
  SRT: {
    경부선: [
      '수서',
      '동탄',
      '평택지제',
      '천안아산',
      '오송',
      '대전',
      '김천구미',
      '동대구',
      '신경주',
      '울산',
      '부산',
    ],
    호남선: [
      '수서',
      '동탄',
      '평택지제',
      '오송',
      '공주',
      '익산',
      '정읍',
      '광주송정',
      '목포',
    ],
  },
  새마을호: {
    경부선: [
      '서울',
      '영등포',
      '수원',
      '평택',
      '천안',
      '조치원',
      '대전',
      '김천',
      '구미',
      '동대구',
      '밀양',
      '구포',
      '부산',
    ],
    전라선: ['용산', '익산', '전주', '남원', '순천', '여수EXPO'],
    장항선: [
      '용산',
      '영등포',
      '수원',
      '천안',
      '아산',
      '온양온천',
      '홍성',
      '대천',
      '장항',
      '군산',
      '익산',
    ],
  },
  'ITX-새마을호': {
    경부선: [
      '서울',
      '영등포',
      '수원',
      '평택',
      '천안',
      '조치원',
      '대전',
      '김천',
      '구미',
      '동대구',
      '밀양',
      '부산',
    ],
    전라선: ['용산', '익산', '전주', '남원', '순천', '여수EXPO'],
  },
  무궁화호: {
    경부선: [
      '서울',
      '영등포',
      '수원',
      '평택',
      '천안',
      '조치원',
      '대전',
      '옥천',
      '김천',
      '구미',
      '동대구',
      '경산',
      '밀양',
      '구포',
      '부산',
    ],
    호남선: [
      '용산',
      '영등포',
      '수원',
      '천안',
      '서대전',
      '계룡',
      '논산',
      '익산',
      '김제',
      '정읍',
      '광주송정',
      '나주',
      '목포',
    ],
    전라선: [
      '용산',
      '익산',
      '전주',
      '남원',
      '곡성',
      '구례구',
      '순천',
      '여수EXPO',
    ],
    중앙선: ['청량리', '양평', '원주', '제천', '단양', '풍기', '영주', '안동'],
    동해선: ['부전', '센텀', '신해운대', '기장', '태화강', '경주', '포항'],
    태백선: ['제천', '태백', '동해'],
    영동선: ['영주', '동해', '강릉'],
  },
  누리로: {
    경부선: ['서울', '영등포', '수원', '평택', '천안', '아산', '신창'],
    장항선: [
      '천안',
      '아산',
      '온양온천',
      '예산',
      '홍성',
      '대천',
      '장항',
      '익산',
    ],
    동해선: [
      '강릉',
      '정동진',
      '묵호',
      '동해',
      '삼척',
      '근덕',
      '임원',
      '옥원',
      '흥부',
      '죽변',
      '울진',
      '매화',
      '기성',
      '후포',
      '고래불',
      '영덕',
      '장사',
      '월포',
      '포항',
      '아화',
      '영천',
      '하양',
      '동대구',
    ],
  },
  'ITX-청춘': {
    경춘선: [
      '용산',
      '청량리',
      '상봉',
      '퇴계원',
      '사릉',
      '평내호평',
      '마석',
      '청평',
      '가평',
      '강촌',
      '남춘천',
      '춘천',
    ],
  },
  'ITX-마음': {
    중앙선: ['청량리', '양평', '원주', '제천', '영주', '안동'],
    동해선: ['부전', '태화강', '경주', '포항'],
  },
  통근열차: {
    정선선: ['민둥산', '별어곡', '선평', '정선', '아우라지'],
  },
  AREX직통: {
    직통: ['서울역', '인천공항1터미널', '인천공항2터미널'],
  },
};

// 전체 노선에서 중복 없이 역 목록 반환 (가나다 정렬)
export const getAllStations = (): string[] => {
  const stations = new Set<string>();
  for (const routes of Object.values(TRAIN_ROUTES)) {
    for (const stationList of Object.values(routes)) {
      stationList.forEach((s) => stations.add(s));
    }
  }
  return Array.from(stations).sort((a, b) => a.localeCompare(b, 'ko'));
};

// 출발역 기준 도달 가능한 역 목록 반환
export const getReachableStations = (startStation: string): string[] => {
  const reachable = new Set<string>();
  for (const routes of Object.values(TRAIN_ROUTES)) {
    for (const stations of Object.values(routes)) {
      if (stations.includes(startStation)) {
        stations.forEach((s) => {
          if (s !== startStation) reachable.add(s);
        });
      }
    }
  }
  return Array.from(reachable);
};

// API 열차 등급명 → TRAIN_ROUTES 키 매핑
const trainTypeAliases: Record<string, string> = {
  'KTX-산천(A-type)': 'KTX-산천A',
  'KTX-산천(B-type)': 'KTX-산천B',
  'ITX-새마을': 'ITX-새마을호',
  무궁화: '무궁화호',
  'KTX-산천 A': 'KTX-산천A',
  'KTX-산천 B': 'KTX-산천B',
};

// 역명 별칭 (API 역명 → 노선 배열 역명)
const stationNameAliases: Record<string, string> = {
  '서울(수서)': '수서',
  '수서(서울)': '수서',
  '동탄(화성)': '동탄',
  '평택지제(삼성)': '평택지제',
  '천안아산(온양온천)': '천안아산',
  '오송(세종)': '오송',
  '김천(구미)': '김천구미',
  '울산(통도사)': '울산',
  인천공항T1: '인천공항1터미널',
  인천공항T2: '인천공항2터미널',
};

// 열차 타입별 역명 오버라이드
const trainStationOverrides: Record<string, Record<string, string>> = {
  SRT: { 서울: '수서', 서울역: '수서' },
};

export const normalizeStation = (
  stationName: string,
  gradeName?: string,
): string => {
  if (gradeName && trainStationOverrides[gradeName]?.[stationName]) {
    return trainStationOverrides[gradeName][stationName];
  }
  return stationNameAliases[stationName] ?? stationName;
};

// 열차 타입 + 출발역/도착역 기준으로 맞는 노선 반환
export const resolveRoute = (
  trainType: string,
  startStation?: string,
  endStation?: string,
): { route: string[]; gradeName: string } => {
  // 열차번호 suffix 제거 (예: "-00037", "-04031")
  const gradeName = trainType.replace(/-\d{4,}$/, '').trim();
  const resolvedKey = TRAIN_ROUTES[gradeName]
    ? gradeName
    : TRAIN_ROUTES[trainTypeAliases[gradeName]]
      ? trainTypeAliases[gradeName]
      : (Object.keys(TRAIN_ROUTES).find((k) => gradeName.startsWith(k)) ?? '');

  const routes = TRAIN_ROUTES[resolvedKey];
  if (!routes) return { route: [], gradeName: resolvedKey || gradeName };

  // 출발역/도착역이 주어지면 두 역이 모두 포함된 노선 선택
  if (startStation && endStation) {
    const matched = Object.values(routes).find(
      (stations) =>
        stations.includes(startStation) && stations.includes(endStation),
    );
    if (matched) return { route: matched, gradeName: resolvedKey };
  }

  // 출발역만 있으면 출발역이 포함된 첫 번째 노선
  if (startStation) {
    const matched = Object.values(routes).find((stations) =>
      stations.includes(startStation),
    );
    if (matched) return { route: matched, gradeName: resolvedKey };
  }

  // fallback: 첫 번째 노선
  return { route: Object.values(routes)[0], gradeName: resolvedKey };
};

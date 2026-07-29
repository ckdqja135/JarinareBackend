/**
 * @role: widgets — PC 추천여행지 모달 상수
 * @rule: 상수 정의만 담당
 */

export const CITY_STATION_MAP: Record<string, string> = {
  부산: '부산',
  경주: '신경주',
  전주: '전주',
  강릉: '강릉',
  여수: '여수EXPO',
  춘천: '춘천',
};

export const CITY_HIGHLIGHTS: Record<
  string,
  { emoji: string; title: string; desc: string }[]
> = {
  부산: [
    {
      emoji: '🏖️',
      title: '해운대 해수욕장',
      desc: '국내 최대 규모의 해변, 여름 피서지의 상징',
    },
    {
      emoji: '🌉',
      title: '광안리 & 광안대교',
      desc: '낮과 밤 모두 다른 매력을 지닌 야경 명소',
    },
    {
      emoji: '🎨',
      title: '감천문화마을',
      desc: '알록달록한 색채로 가득한 산복도로 예술 마을',
    },
    {
      emoji: '🐟',
      title: '자갈치시장',
      desc: '활어와 해산물이 넘치는 부산 대표 전통 시장',
    },
  ],
  경주: [
    {
      emoji: '🏯',
      title: '불국사',
      desc: '유네스코 세계문화유산, 신라 불교 건축의 정수',
    },
    { emoji: '🔭', title: '첨성대', desc: '동양에서 가장 오래된 천문 관측대' },
    {
      emoji: '⛰️',
      title: '대릉원',
      desc: '신라 왕들의 고분군이 펼쳐진 역사 공원',
    },
    {
      emoji: '☕',
      title: '황리단길',
      desc: '한옥과 카페가 어우러진 경주의 핫플레이스',
    },
  ],
  전주: [
    {
      emoji: '🏘️',
      title: '전주한옥마을',
      desc: '700여 채의 한옥이 밀집한 국내 최대 한옥촌',
    },
    {
      emoji: '🏛️',
      title: '경기전',
      desc: '조선 태조 이성계의 어진을 모신 사적지',
    },
    {
      emoji: '🛒',
      title: '남부시장',
      desc: '전주 대표 야시장과 먹거리가 가득한 전통 시장',
    },
    {
      emoji: '🍚',
      title: '전주비빔밥',
      desc: '형형색색 재료가 어우러진 전주의 대표 향토 음식',
    },
  ],
  강릉: [
    {
      emoji: '🌊',
      title: '경포해변',
      desc: '넓고 깨끗한 동해 바다와 소나무 숲이 어우러진 해변',
    },
    {
      emoji: '☕',
      title: '안목 커피거리',
      desc: '강릉 커피 문화의 발원지, 바다 뷰 카페 밀집 거리',
    },
    {
      emoji: '🏡',
      title: '오죽헌',
      desc: '신사임당과 율곡 이이가 태어난 유서 깊은 고택',
    },
    {
      emoji: '🌅',
      title: '정동진',
      desc: '바다와 가장 가까운 역으로 유명한 일출 명소',
    },
  ],
  여수: [
    {
      emoji: '🌃',
      title: '여수밤바다',
      desc: '버스커버스커 노래로 유명해진 낭만 항구 야경',
    },
    {
      emoji: '🌸',
      title: '오동도',
      desc: '동백꽃과 기암절벽이 아름다운 작은 섬',
    },
    {
      emoji: '🛕',
      title: '향일암',
      desc: '일출로 유명한 절벽 위의 암자, 사계절 절경',
    },
    {
      emoji: '🌏',
      title: '엑스포 해양공원',
      desc: '2012 세계박람회 개최지, 해양과학 볼거리의 중심',
    },
  ],
  춘천: [
    {
      emoji: '🏝️',
      title: '남이섬',
      desc: '드라마 겨울연가 촬영지, 사계절 낭만 섬',
    },
    {
      emoji: '🍗',
      title: '닭갈비 골목',
      desc: '춘천을 대표하는 매콤달콤한 철판 닭갈비의 성지',
    },
    {
      emoji: '🚶',
      title: '소양강 스카이워크',
      desc: '소양강 위를 걷는 투명 유리 전망 산책로',
    },
    {
      emoji: '📚',
      title: '김유정문학촌',
      desc: '소설가 김유정의 생가와 문학을 체험하는 문화 공간',
    },
  ],
};

export const CITY_ROUTES: Record<
  string,
  { from: string; to: string; time: string; fare: string; train: string }[]
> = {
  부산: [
    {
      from: '서울',
      to: '대전',
      time: '약 50분',
      fare: '약 23,700원',
      train: 'KTX',
    },
    {
      from: '대전',
      to: '동대구',
      time: '약 40분',
      fare: '약 14,500원',
      train: 'KTX',
    },
    {
      from: '동대구',
      to: '구포',
      time: '약 20분',
      fare: '약 7,800원',
      train: 'KTX',
    },
    {
      from: '구포',
      to: '부산',
      time: '약 10분',
      fare: '약 3,200원',
      train: 'KTX',
    },
  ],
  경주: [
    {
      from: '서울',
      to: '천안아산',
      time: '약 30분',
      fare: '약 12,400원',
      train: 'KTX',
    },
    {
      from: '천안아산',
      to: '동대구',
      time: '약 1시간 10분',
      fare: '약 31,100원',
      train: 'KTX',
    },
    {
      from: '동대구',
      to: '경산',
      time: '약 10분',
      fare: '약 2,600원',
      train: 'KTX',
    },
    {
      from: '경산',
      to: '신경주',
      time: '약 15분',
      fare: '약 4,800원',
      train: 'KTX',
    },
  ],
  전주: [
    {
      from: '서울',
      to: '천안아산',
      time: '약 30분',
      fare: '약 12,400원',
      train: 'KTX',
    },
    {
      from: '천안아산',
      to: '오송',
      time: '약 10분',
      fare: '약 4,200원',
      train: 'KTX',
    },
    {
      from: '오송',
      to: '익산',
      time: '약 20분',
      fare: '약 7,000원',
      train: 'KTX',
    },
    {
      from: '익산',
      to: '전주',
      time: '약 15분',
      fare: '약 2,600원',
      train: 'ITX-새마을',
    },
  ],
  강릉: [
    {
      from: '서울',
      to: '청량리',
      time: '약 10분',
      fare: '약 1,800원',
      train: 'KTX-이음',
    },
    {
      from: '청량리',
      to: '만종',
      time: '약 40분',
      fare: '약 18,300원',
      train: 'KTX-이음',
    },
    {
      from: '만종',
      to: '진부',
      time: '약 15분',
      fare: '약 3,900원',
      train: 'KTX-이음',
    },
    {
      from: '진부',
      to: '강릉',
      time: '약 20분',
      fare: '약 4,500원',
      train: 'KTX-이음',
    },
  ],
  여수: [
    {
      from: '서울',
      to: '오송',
      time: '약 40분',
      fare: '약 18,200원',
      train: 'KTX',
    },
    {
      from: '오송',
      to: '익산',
      time: '약 20분',
      fare: '약 7,000원',
      train: 'KTX',
    },
    {
      from: '익산',
      to: '순천',
      time: '약 50분',
      fare: '약 16,800원',
      train: 'KTX',
    },
    {
      from: '순천',
      to: '여수EXPO',
      time: '약 20분',
      fare: '약 5,600원',
      train: 'KTX',
    },
  ],
  춘천: [
    {
      from: '서울',
      to: '상봉',
      time: '약 10분',
      fare: '약 1,700원',
      train: 'ITX-청춘',
    },
    {
      from: '상봉',
      to: '평내호평',
      time: '약 20분',
      fare: '약 4,200원',
      train: 'ITX-청춘',
    },
    {
      from: '평내호평',
      to: '가평',
      time: '약 15분',
      fare: '약 3,100원',
      train: 'ITX-청춘',
    },
    {
      from: '가평',
      to: '춘천',
      time: '약 20분',
      fare: '약 3,800원',
      train: 'ITX-청춘',
    },
  ],
};

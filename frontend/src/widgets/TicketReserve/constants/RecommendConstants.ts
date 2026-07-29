/**
 * @role: widgets — 추천 여행지 상수 정의
 * @rule: 상수 정의만 담당
 */
import { Category, DestinationItem } from '../types/RecommendDestinationType';
import busan from '@/assets/background/부산.png';
import gyeongju from '@/assets/background/경주.png';
import jeonju from '@/assets/background/전주.png';
import chuncheon from '@/assets/background/춘천.png';
import gangneung from '@/assets/background/강릉.png';
import yeosu from '@/assets/background/여수.png';

export const CATEGORIES: Category[] = [
  '전체',
  '바다',
  '역사',
  '맛집',
  '자연',
  '야경',
];

export const AGES = ['10대', '20대', '30대', '40대', '50대', '60대+'];

export const DESTINATIONS: DestinationItem[] = [
  {
    city: '부산',
    desc: '해운대·광안리 바다',
    gradient: '#0ea5e9',
    category: ['바다', '야경'],
    image: busan,
  },
  {
    city: '경주',
    desc: '천년고도 역사 여행',
    gradient: '#f59e0b',
    category: ['역사'],
    image: gyeongju,
  },
  {
    city: '전주',
    desc: '한옥마을·한식 맛집',
    gradient: '#10b981',
    category: ['맛집', '역사'],
    image: jeonju,
  },
  {
    city: '강릉',
    desc: '동해 바다·커피 거리',
    gradient: '#6366f1',
    category: ['바다', '맛집'],
    image: gangneung,
  },
  {
    city: '여수',
    desc: '낭만 항구 야경',
    gradient: '#ec4899',
    category: ['바다', '야경'],
    image: yeosu,
  },
  {
    city: '춘천',
    desc: '닭갈비·소양강 댐',
    gradient: '#14b8a6',
    category: ['맛집', '자연'],
    image: chuncheon,
  },
];

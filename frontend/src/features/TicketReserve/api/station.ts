// @role: features/TicketReserve/api
// @rule: 역 목록은 백엔드 /api/stations 에서 조회 (서비스키 서버 보관)
import { backendClient } from '@/shared/api/backendClient';
import type { StationProps } from '../types/stationType';

export const fetchAllStations = async (): Promise<StationProps> => {
  const { data } = await backendClient.get('/api/stations');
  return data;
};

// @role: features/TicketReserve/api
// @rule: 열차 시간은 백엔드 /trains/times 에서 조회 (서비스키 서버 보관)
import { backendClient } from '@/shared/api/backendClient';
import { errorStateStore } from '../model/errorStateStore';

export const getTimeByStation = async (
  startStation: string,
  endStation: string,
  startDay: string,
  trainType?: string,
) => {
  const { setError } = errorStateStore.getState();

  if (!startStation || !endStation || !startDay) return [];

  try {
    const { data } = await backendClient.get('/trains/times', {
      params: {
        depPlaceId: startStation,
        arrPlaceId: endStation,
        depPlandTime: startDay,
        trainGradeCode: trainType,
        pageNo: 1,
        numOfRows: 200,
      },
    });
    return data ?? [];
  } catch (e) {
    if (e instanceof Error) setError(e.message);
    return [];
  }
};

import { TrainDataStoreType } from './../types/trainDataStoreType';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 리렌더링 발생 시 상태 유지
// sessionStorage에 상태 저장
export const trainDataStore = create(
  persist<TrainDataStoreType>(
    (set) => ({
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
      pay: '',
      trainType: '',
      trainNo: '1',
      startStation: '',
      endStation: '',
      kid: 0,
      adult: 0,
      startStationForView: '',
      endStationForView: '',
      startDayForView: '',
      endDayForView: '',
      trainTypeForView: '',
      startTimeForView: '',
      selectStartTime: 0,
      selectEndTime: 0,
      selectTrainType: '',
      selectKid: 0,
      selectAdult: 0,
      selectPay: 0,
      seatsId: [],
      setSelectKid: (selectKid: number) => set(() => ({ selectKid })),
      setSelectAdult: (selectAdult: number) => set(() => ({ selectAdult })),
      setSelectPay: (selectPay: number) => set(() => ({ selectPay })),
      setStartDay: (startDay: string) => set(() => ({ startDay })),
      setEndDay: (endDay: string) => set(() => ({ endDay })),
      setStartTime: (startTime: string) => set(() => ({ startTime })),
      setEndTime: (endTime: string) => set(() => ({ endTime })),
      setPay: (pay: string) => set(() => ({ pay })),
      setTrainType: async (trainType: string) => set(() => ({ trainType })),
      setTrainNo: (trainNo: string) => set(() => ({ trainNo })),
      setStartStation: (startStation: string) => set(() => ({ startStation })),
      setEndStation: (endStation: string) => set(() => ({ endStation })),
      setKid: (kid: number) => set(() => ({ kid })),
      setAdult: (adult: number) => set(() => ({ adult })),
      setStartStationForView: (startStationForView: string) =>
        set(() => ({ startStationForView })),
      setEndStationForView: (endStationForView: string) =>
        set(() => ({ endStationForView })),
      setStartDayForView: (startDayForView: string) =>
        set(() => ({ startDayForView })),
      setEndDayForView: (endDayForView: string) =>
        set(() => ({ endDayForView })),
      setTrainTypeForView: (trainTypeForView: string) =>
        set(() => ({ trainTypeForView })),
      setStartTimeForView: (startTimeForView: string) =>
        set(() => ({ startTimeForView })),
      setSelectStartTime: (selectStartTime: number) =>
        set(() => ({ selectStartTime })),
      setSelectEndTime: (selectEndTime: number) =>
        set(() => ({ selectEndTime })),
      setSelectTrainType: (selectTrainType: string) =>
        set(() => ({ selectTrainType })),
      setSeatsId: (seatsId: string[]) => set(() => ({ seatsId })),
    }),
    {
      name: 'trainTiem-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

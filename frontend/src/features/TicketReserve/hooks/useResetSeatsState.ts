import { useEffect } from 'react';
import { seatsStateStore } from '../model/seatsStateStore';
import { seatsStateCountStore } from '../model/seatsStateCountStore';
import { trainDataStore } from '../model/trainDataStore';

export const useResetSeatsState = () => {
  const { trainNo } = trainDataStore();
  const { setSeatsState } = seatsStateStore();
  const { setSeatsStateCount } = seatsStateCountStore();

  useEffect(() => {
    setSeatsState({});
    setSeatsStateCount(0);
  }, [trainNo]);
};

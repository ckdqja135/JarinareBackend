import { SERVICE_KEY, TRAIN_URL } from '@/shared/Train/TrainConfig';
import axios from 'axios';

export const instance = axios.create({
  baseURL: TRAIN_URL,
  headers: { 'Content-Type': 'application/json' },
  params: { serviceKey: SERVICE_KEY, _type: 'json' },
});

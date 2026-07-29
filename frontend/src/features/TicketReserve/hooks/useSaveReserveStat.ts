import { backendClient } from '@/shared/api/backendClient';

export const useSaveReserveStat = () => {
  const saveStat = async (destination: string) => {
    if (!destination) return;
    await backendClient.post('/api/travel-stats', { destination });
  };

  return { saveStat };
};

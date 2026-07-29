import { backendClient } from '@/shared/api/backendClient';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export type StatItem = {
  destination: string;
  totalCount: number;
  byAge: Record<string, number>;
  byGender: Record<string, number>;
};

type StatResponse = {
  destination: string;
  totalCount: number;
  stats: Record<string, number>;
};

export const useTravelStatic = () => {
  const [age, setAge] = useState(false);
  const [gender, setGender] = useState(true);

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['travel-stats'],
    queryFn: async () => {
      const res = await backendClient.get<StatResponse[]>('/api/travel-stats');
      return res.data.map((item) => {
        const byAge: Record<string, number> = {};
        const byGender: Record<string, number> = {};
        Object.entries(item.stats).forEach(([key, val]) => {
          if (key.startsWith('age_')) byAge[key.replace('age_', '')] = val;
          if (key.startsWith('gender_')) byGender[key.replace('gender_', '')] = val;
        });
        return { destination: item.destination, totalCount: item.totalCount, byAge, byGender };
      });
    },
    staleTime: 60000,
  });

  return { age, gender, setAge, setGender, stats, isLoading };
};

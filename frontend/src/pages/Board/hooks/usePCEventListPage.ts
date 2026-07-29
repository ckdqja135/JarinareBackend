/**
 * @role: pages — PC 이벤트 목록 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export type EventSortOrder = 'newest' | 'oldest';

export const usePCEventListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('newest');
  const { user } = useCurrentUser();
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  return { searchQuery, setSearchQuery, sortOrder, setSortOrder, isAdmin };
};

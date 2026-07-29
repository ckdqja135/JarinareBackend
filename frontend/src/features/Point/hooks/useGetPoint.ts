// @role: features — 현재 포인트 조회
// @rule: api/ 호출만 담당
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useGetPoint = () => {
  const { user } = useCurrentUser();
  return { point: user?.point ?? 0 };
};

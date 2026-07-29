/**
 * @role: features — 팔로우 토글 및 팔로우 상태 조회
 * @rule: api/ 호출만 담당, Firestore/RealtimeDB 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { useEffect, useState } from 'react';

export const useFollow = (targetUid: string, _targetName: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // 팔로우 여부 초기 조회
  useEffect(() => {
    if (!user || !targetUid || user.uid === targetUid) return;
    backendClient
      .get<{ following: boolean }>(`/api/users/${targetUid}/follow-status`)
      .then(({ data }) => setIsFollowing(data.following))
      .catch(() => {});
  }, [user?.uid, targetUid]);

  const toggleFollow = async () => {
    if (!user || !targetUid || user.uid === targetUid || loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await backendClient.delete(`/api/users/${targetUid}/follow`);
        setIsFollowing(false);
      } else {
        await backendClient.put(`/api/users/${targetUid}/follow`);
        setIsFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, toggleFollow };
};

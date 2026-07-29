/**
 * @role: features — 팔로워/팔로잉 목록 조회
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { backendClient } from '@/shared/api/backendClient';
import { FollowEntry } from '@/entities/Follow/types/followType';
import { useEffect, useState } from 'react';

type FollowListResponse = {
  data: FollowEntry[];
  total: number;
  page: number;
  size: number;
};

export const useFollowList = (targetUid?: string) => {
  const [followers, setFollowers] = useState<FollowEntry[]>([]);
  const [following, setFollowing] = useState<FollowEntry[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const uid = targetUid ?? auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const fetchAll = async () => {
      const [followersRes, followingRes] = await Promise.all([
        backendClient.get<FollowListResponse>(`/api/users/${uid}/followers`),
        backendClient.get<FollowListResponse>(`/api/users/${uid}/following`),
      ]);

      const followerList = followersRes.data.data;
      const followingList = followingRes.data.data;

      setFollowers(followerList);
      setFollowing(followingList);
      setCounts({ followers: followerList.length, following: followingList.length });
    };

    fetchAll().catch(() => {});
  }, [uid]);

  return { followers, following, counts };
};

/**
 * @role: features — 팔로워/팔로잉 목록에서 삭제 액션
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { backendClient } from '@/shared/api/backendClient';

export const useFollowListActions = () => {
  // 내 팔로잉 삭제 (내가 상대방을 팔로우하는 관계 제거)
  const removeFollowing = async (targetUid: string) => {
    await backendClient.delete(`/api/users/${targetUid}/follow`);
  };

  // 내 팔로워 삭제는 현재 백엔드 미지원 (상대방 대신 API 호출 불가)
  const removeFollower = async (_followerUid: string) => {};

  return { removeFollower, removeFollowing };
};

/**
 * @role: widgets — 팔로우 모달 타입 정의
 * @rule: 타입 정의만 담당, 로직 포함 금지
 */
import { FollowEntry } from '@/entities/Follow/types/followType';

export type FollowModalTab = 'followers' | 'following';

export interface PCFollowModalProps {
  followers: FollowEntry[];
  following: FollowEntry[];
  counts: { followers: number; following: number };
  initialTab: FollowModalTab;
  onClose: () => void;
}

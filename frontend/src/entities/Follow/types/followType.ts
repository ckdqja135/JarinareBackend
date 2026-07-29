export interface FollowEntry {
  uid: string;
  name: string;
  followedAt: number;
}

export interface FollowNotificationType {
  followerUid: string;
  followerName: string;
  isRead: boolean;
  createdAt: number;
}

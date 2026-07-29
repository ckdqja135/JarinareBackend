/**
 * @role: widgets — 팔로우 모달 상태·핸들러 담당
 * @rule: 상태·이벤트 핸들러만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { FollowEntry } from '@/entities/Follow/types/followType';
import { useFollowListActions } from '@/features/Follow/hooks/useFollowListActions';
import { FollowModalTab } from '../types/followModalTypes';

export const usePCFollowModal = (
  followers: FollowEntry[],
  following: FollowEntry[],
  initialTab: FollowModalTab,
) => {
  const [tab, setTab] = useState<FollowModalTab>(initialTab);
  const [localFollowers, setLocalFollowers] = useState<FollowEntry[] | null>(
    null,
  );
  const [localFollowing, setLocalFollowing] = useState<FollowEntry[] | null>(
    null,
  );
  const { removeFollower, removeFollowing } = useFollowListActions();

  const displayedFollowers = localFollowers ?? followers;
  const displayedFollowing = localFollowing ?? following;
  const list = tab === 'followers' ? displayedFollowers : displayedFollowing;

  const handleRemove = async (uid: string) => {
    if (tab === 'followers') {
      setLocalFollowers((prev) =>
        (prev ?? followers).filter((e) => e.uid !== uid),
      );
      await removeFollower(uid);
    } else {
      setLocalFollowing((prev) =>
        (prev ?? following).filter((e) => e.uid !== uid),
      );
      await removeFollowing(uid);
    }
  };

  return {
    tab,
    setTab,
    list,
    displayedFollowers,
    displayedFollowing,
    handleRemove,
  };
};

/**
 * @role: pages — 마이페이지 모달 상태·핸들러 담당
 * @rule: 상태·이벤트 핸들러만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { FollowTab } from '../types/myPageTypes';

export const useMyPageModal = () => {
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<FollowTab>('followers');

  const openFollowModal = (tab: FollowTab) => {
    setFollowModalTab(tab);
    setFollowModalOpen(true);
  };

  const closeFollowModal = () => setFollowModalOpen(false);

  return { followModalOpen, followModalTab, openFollowModal, closeFollowModal };
};

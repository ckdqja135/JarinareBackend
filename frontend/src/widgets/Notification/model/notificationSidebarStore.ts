/**
 * @role: widgets — 알림 사이드바 열림/닫힘 전역 상태
 * @rule: UI 렌더링 조건만 관리, 비즈니스 로직 포함 금지
 */
import { create } from 'zustand';

interface NotificationSidebarStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const useNotificationSidebarStore = create<NotificationSidebarStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export default useNotificationSidebarStore;

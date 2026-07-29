// @role: features — 알림 상태 플래그 (백엔드 알림으로 대체됨)
// @rule: 백엔드가 알림 상태를 관리하므로 클라이언트 Firestore 플래그 불필요
export const useIsNotification = () => {
  const updateIsChange = async (_change: boolean) => {};
  const updateIsResponse = async (_response: boolean) => {};
  return { updateIsChange, updateIsResponse };
};

/**
 * @role: pages — 설정 페이지 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useIsNotification } from '@/features/Notification/hooks/useIsNotification';
import { useIsNotificationResponse } from '@/features/Notification/hooks/useIsNotificationResponse';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useNavigate } from 'react-router-dom';

export const useSettingPage = () => {
  const navigate = useNavigate();
  const { updateIsChange, updateIsResponse } = useIsNotification();
  const { isNotification } = useIsNotificationResponse();

  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY);
  const handleLoginNavigate = () => navigate('/auth/login');

  const data = isNotification?.data() ?? {};
  const changeOn = data.change ?? false;
  const responseOn = data.response ?? false;
  const allOn = changeOn && responseOn;

  const handleAllToggle = () => {
    updateIsChange(!allOn);
    updateIsResponse(!allOn);
  };
  const handleChangeToggle = () => updateIsChange(!changeOn);
  const handleResponseToggle = () => updateIsResponse(!responseOn);

  return {
    isLoggedIn,
    handleLoginNavigate,
    isNotification,
    changeOn,
    responseOn,
    allOn,
    handleAllToggle,
    handleChangeToggle,
    handleResponseToggle,
  };
};

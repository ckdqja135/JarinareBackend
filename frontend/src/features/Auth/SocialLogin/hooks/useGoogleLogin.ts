// Google 소셜 로그인 - Firebase Auth 제거로 인해 미구현 상태
export const useGoogleLogin = () => {
  const onClick = () => {
    console.warn('Google 로그인은 현재 지원되지 않습니다.');
  };
  return { onClick };
};

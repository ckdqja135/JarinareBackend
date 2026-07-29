// HACK: 추후 백단 변경 예정

// import { useState } from 'react';
// import { kakaoMessage } from '@/features/Notification/hooks/kakaoMessage';

// export default function KakaoMessageButton() {
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     const accessToken = localStorage.getItem('kakao_access_token');
//     if (!accessToken) return alert('카카오 로그인 토큰이 없습니다.');
//     setLoading(true);
//     try {
//       // 메시지 보내기
//       const res = await kakaoMessage(accessToken!);
//       console.log('메시지 전송 성공:', res);
//       alert('메시지 전송 성공!');
//     } catch (err) {
//       console.error('메시지 전송 실패:', err);
//       alert('메시지 전송 실패');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button onClick={handleSend} disabled={loading}>
//       {loading ? '전송 중...' : '카카오 메시지 보내기'}
//     </button>
//   );
// }

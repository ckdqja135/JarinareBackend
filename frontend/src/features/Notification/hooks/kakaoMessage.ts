// HACK: 추후 백단 변경 예정

// import axios from 'axios';

// export const kakaoMessage = async (access_token: string) => {
//   try {
//     const payload = new URLSearchParams({
//       template_object: JSON.stringify({
//         object_type: 'text',
//         text: '예매하신 기차 시간이 다가옵니다!',
//         link: {
//           web_url: 'https://jarinare.vercel.app/',
//           mobile_web_url: 'https://jarinare.vercel.app/',
//         },
//       }),
//     });

//     const response = await axios.post(
//       'https://kapi.kakao.com/v2/api/talk/memo/default/send',
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//           'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
//         },
//       },
//     );

//     return response.data;
//   } catch (err) {
//     console.error('카카오 메시지 전송 실패:', err);
//     throw err;
//   }
// };

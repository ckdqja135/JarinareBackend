/**
 * @role: features — 공지사항 삭제 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { deleteNoticeApi } from '../api/deleteNoticeApi';

export const useDeleteNotice = () => {
  const deleteNotice = async (noticeId: string) => {
    try {
      await deleteNoticeApi(noticeId);
    } catch (error) {
      console.log(error);
    }
  };
  return { deleteNotice };
};

/**
 * @role: features — 공지사항 게시글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createNoticeApi } from '../api/createNoticeApi';

export const useCreateNotice = () => {
  const createNotice = async (
    title: string,
    content: string,
    imageUrl?: string | null,
  ) => {
    if (!auth.currentUser) return;
    return createNoticeApi(title, content, imageUrl);
  };
  return { createNotice };
};

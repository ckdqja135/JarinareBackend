/**
 * @role: features — 이벤트 게시글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createEventApi } from '../api/createEventApi';

export const useCreateEvent = () => {
  const createEvent = async (
    title: string,
    content: string,
    imageUrl?: string | null,
  ) => {
    if (!auth.currentUser) return;
    return createEventApi(title, content, imageUrl);
  };
  return { createEvent };
};

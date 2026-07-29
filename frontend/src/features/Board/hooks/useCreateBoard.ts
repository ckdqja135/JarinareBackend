/**
 * @role: features — 자유게시판 게시글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createBoardApi } from '../api/createBoardApi';

export const useCreateBoard = () => {
  const createBoard = async (
    title: string,
    content: string,
    tags: string[] = [],
    imageUrl?: string | null,
  ) => {
    if (!auth.currentUser) return;
    return createBoardApi(title, content, tags, imageUrl);
  };
  return { createBoard };
};

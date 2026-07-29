/**
 * @role: features — 댓글 생성 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { createCommentApi } from '../api/createCommentApi';

export const useCreateComment = (
  boardType: string,
  postId: string,
  onSuccess?: () => void,
) => {
  const createComment = async (
    content: string,
    parentId: string | null = null,
  ) => {
    if (!auth.currentUser || !content.trim()) return;
    await createCommentApi(boardType, postId, content, parentId);
    onSuccess?.();
  };

  return { createComment };
};

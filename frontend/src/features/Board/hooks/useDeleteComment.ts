/**
 * @role: features — 댓글·대댓글 삭제 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { deleteCommentApi } from '../api/deleteCommentApi';

export const useDeleteComment = (
  boardType: string,
  postId: string,
  onSuccess?: () => void,
) => {
  const deleteComment = async (commentId: string) => {
    if (!auth.currentUser) return;
    await deleteCommentApi(boardType, postId, commentId);
    onSuccess?.();
  };

  return { deleteComment };
};

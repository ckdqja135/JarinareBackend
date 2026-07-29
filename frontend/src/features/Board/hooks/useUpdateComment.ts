/**
 * @role: features — 댓글 수정 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { updateCommentApi } from '../api/updateCommentApi';

export const useUpdateComment = (
  boardType: string,
  postId: string,
  onSuccess?: () => void,
) => {
  const updateComment = async (commentId: string, content: string) => {
    if (!auth.currentUser || !content.trim()) return;
    await updateCommentApi(boardType, postId, commentId, content);
    onSuccess?.();
  };

  return { updateComment };
};

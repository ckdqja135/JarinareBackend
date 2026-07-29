/**
 * @role: features — 게시물 삭제 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { deletePostApi } from '../api/deletePostApi';

export const useDeletePost = () => {
  const deletePost = async (boardType: string, postId: string) => {
    try {
      await deletePostApi(boardType, postId);
    } catch (error) {
      console.log(error);
    }
  };

  return { deletePost };
};

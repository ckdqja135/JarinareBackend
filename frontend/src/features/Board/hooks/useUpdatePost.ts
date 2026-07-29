/**
 * @role: features — 게시물 수정 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { updatePostApi } from '../api/updatePostApi';

export const useUpdatePost = () => {
  const updatePost = async (
    boardType: string,
    postId: string,
    data: { title: string; content: string; tags?: string[] },
  ) => {
    try {
      await updatePostApi(boardType, postId, data);
    } catch (error) {
      console.log(error);
    }
  };
  return { updatePost };
};

/**
 * @role: features — 자유게시판 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { auth } from '@/shared/firebase/firebase';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  getBoardLikeStatusApi,
  toggleBoardLikeApi,
} from '../api/likeBoardApi';

export const useLikeBoard = (items: BoardPost[]) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // items 변경 시 post.likes 로 초기화
  useEffect(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.id] = item.likes;
    });
    setLikesMap(map);
  }, [items]);

  // 로그인 유저의 좋아요 상태 로드
  useEffect(() => {
    if (!user || items.length === 0) return;

    Promise.all(
      items.map((item) =>
        getBoardLikeStatusApi(item.id).then((status) => ({
          id: item.id,
          liked: status.liked,
          count: status.count,
        })),
      ),
    ).then((results) => {
      const likedResult: Record<string, boolean> = {};
      const countResult: Record<string, number> = {};
      results.forEach((r) => {
        likedResult[r.id] = r.liked;
        countResult[r.id] = r.count;
      });
      setLikedMap(likedResult);
      setLikesMap(countResult);
    });
  }, [user, items.length]);

  const handleClickLike = async (boardId: string) => {
    if (!user || processingRef.current.has(boardId)) return;
    processingRef.current.add(boardId);

    const isCurrentlyLiked = likedMap[boardId] ?? false;
    setLikedMap((prev) => ({ ...prev, [boardId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [boardId]: (prev[boardId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const result = await toggleBoardLikeApi(boardId, isCurrentlyLiked);
      setLikedMap((prev) => ({ ...prev, [boardId]: result.liked }));
      setLikesMap((prev) => ({ ...prev, [boardId]: result.count }));
    } catch (error) {
      console.error('자유게시판 좋아요 오류:', error);
      setLikedMap((prev) => ({ ...prev, [boardId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [boardId]: (prev[boardId] ?? 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    } finally {
      processingRef.current.delete(boardId);
    }
  };

  return { likedMap, likesMap, handleClickLike };
};

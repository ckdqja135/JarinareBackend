/**
 * @role: features — 이벤트 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { auth } from '@/shared/firebase/firebase';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  getEventLikeStatusApi,
  toggleEventLikeApi,
} from '../api/likeEventApi';

export const useLikeEvent = (items: BoardPost[]) => {
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
        getEventLikeStatusApi(item.id).then((status) => ({
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

  const handleClickLike = async (eventId: string) => {
    if (!user || processingRef.current.has(eventId)) return;
    processingRef.current.add(eventId);

    const isCurrentlyLiked = likedMap[eventId] ?? false;
    setLikedMap((prev) => ({ ...prev, [eventId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const result = await toggleEventLikeApi(eventId, isCurrentlyLiked);
      setLikedMap((prev) => ({ ...prev, [eventId]: result.liked }));
      setLikesMap((prev) => ({ ...prev, [eventId]: result.count }));
    } catch (error) {
      console.error('이벤트 좋아요 오류:', error);
      setLikedMap((prev) => ({ ...prev, [eventId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] ?? 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    } finally {
      processingRef.current.delete(eventId);
    }
  };

  return { likedMap, likesMap, handleClickLike };
};

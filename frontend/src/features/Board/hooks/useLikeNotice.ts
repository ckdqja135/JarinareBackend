/**
 * @role: features — 공지사항 좋아요 상태·토글 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { auth } from '@/shared/firebase/firebase';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  getNoticeLikeStatusApi,
  toggleNoticeLikeApi,
} from '../api/likeNoticeApi';

export const useLikeNoitce = (items: BoardPost[]) => {
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
        getNoticeLikeStatusApi(item.id).then((status) => ({
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

  const handleClickLike = async (noticeId: string) => {
    if (!user || processingRef.current.has(noticeId)) return;
    processingRef.current.add(noticeId);

    const isCurrentlyLiked = likedMap[noticeId] ?? false;
    setLikedMap((prev) => ({ ...prev, [noticeId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [noticeId]: (prev[noticeId] ?? 0) + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const result = await toggleNoticeLikeApi(noticeId, isCurrentlyLiked);
      setLikedMap((prev) => ({ ...prev, [noticeId]: result.liked }));
      setLikesMap((prev) => ({ ...prev, [noticeId]: result.count }));
    } catch (error) {
      console.error('공지 좋아요 오류:', error);
      setLikedMap((prev) => ({ ...prev, [noticeId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [noticeId]: (prev[noticeId] ?? 0) + (isCurrentlyLiked ? 1 : -1),
      }));
    } finally {
      processingRef.current.delete(noticeId);
    }
  };

  return { likedMap, likesMap, handleClickLike };
};

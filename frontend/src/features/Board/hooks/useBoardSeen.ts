/**
 * @role: features — 게시판 마지막 방문 시각 조회·갱신 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { auth } from '@/shared/firebase/firebase';
import { useEffect, useState } from 'react';
import { getBoardSeenApi, updateBoardSeenApi } from '../api/boardSeenApi';

type Category = 'notice' | 'event' | 'board';

interface SeenData {
  notice: number;
  event: number;
  board: number;
}

export const useBoardSeen = () => {
  const [seenData, setSeenData] = useState<SeenData>({
    notice: 0,
    event: 0,
    board: 0,
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    getBoardSeenApi().then((data) => {
      if (data) setSeenData(data);
    });
  }, []);

  const markSeen = async (category: Category) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const now = Math.floor(Date.now() / 1000);
    await updateBoardSeenApi(uid, category, now);
    setSeenData((prev) => ({ ...prev, [category]: now }));
  };

  return { seenData, markSeen };
};

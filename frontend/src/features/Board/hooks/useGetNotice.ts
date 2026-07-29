/**
 * @role: features — 공지사항 게시글 목록 조회 훅
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { useEffect, useState } from 'react';
import { getNoticePostsApi } from '../api/getNoticeApi';

export const useGetNotice = () => {
  const [noticeData, setNoticeData] = useState<BoardPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getNoticePostsApi()
      .then(({ data: datas }) => {
        setNoticeData(
          datas
            .filter((d) => d.title)
            .sort((a, b) => a.createdAt - b.createdAt),
        );
      })
      .catch((e) => console.error('[useGetNotice] 공지사항 로드 실패:', e))
      .finally(() => setIsLoaded(true));
  }, []);

  return { noticeData, isLoaded };
};

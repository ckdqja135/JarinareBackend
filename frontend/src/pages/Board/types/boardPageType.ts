/**
 * @role: pages — 게시판 페이지 타입 정의
 * @rule: 타입 정의만 담당
 */
import { BoardPost } from '@/entities/Board/types/boardType';

export type BoardFilter = '전체' | '공지' | '이벤트' | '자유';
export type BoardSortOrder = 'newest' | 'views';
export type PostCategory = 'board' | 'notice' | 'event';
export type SearchResultPost = BoardPost & { _category: PostCategory };

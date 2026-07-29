/**
 * @role: entities — 게시판 도메인 타입 정의
 * @rule: 타입 정의만 담당
 */
export interface BoardPost {
  id: string;
  authorUid?: string;
  author: string;
  content: string;
  title: string;
  views: number;
  likes: number;
  createdAt: number;
  imageUrl: string | null;
  commentCount?: number;
  tags?: string[];
}

export interface BoardCategory {
  id: string;
  name: string;
  description?: string;
}

export interface BoardState {
  posts: BoardPost[];
  categories: BoardCategory[];
  currentCategory: string | null;
  isLoading: boolean;
  error: string | null;
}

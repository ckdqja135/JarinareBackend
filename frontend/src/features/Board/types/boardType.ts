/**
 * @role: features — 게시판 도메인 타입 정의
 * @rule: 타입·인터페이스 정의만 담당
 */
export interface LatestPost {
  id: string;
  title: string;
  content: string;
  author: string;
  viewCount: number;
  createdAt: number;
  commentCount: number;
}

export interface LatestPosts {
  notice: LatestPost | null;
  event: LatestPost | null;
  board: LatestPost | null;
  board2: LatestPost | null;
}

export interface BoardCounts {
  notice: number;
  event: number;
  board: number;
}

export type BoardType = {
  onAuthorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setPreviewImg: React.Dispatch<React.SetStateAction<string | null>>;
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  author: string;
  title: string;
  content: string;
  previewImg: string | null;
  loading: boolean;
  tags?: string[];
  tagInput?: string;
  onTagInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag?: (tag: string) => void;
};

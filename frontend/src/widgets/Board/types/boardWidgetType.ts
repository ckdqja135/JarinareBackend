/**
 * @role: widgets — 게시판 위젯 타입 정의
 * @rule: 타입 정의만 담당
 */
import { BoardType } from '@/features/Board/types/boardType';

export type SortOrder = 'newest' | 'oldest' | 'views' | 'likes';

export interface BoardProps {
  isPC?: boolean;
  externalSearchQuery?: string;
  externalSortOrder?: 'newest' | 'views';
}

export type WriteCategory = 'board' | 'notice' | 'event';

export interface PCWriteFormProps extends BoardType {
  categoryLabel: string;
  backLabel: string;
  categorySelectable?: boolean;
  selectedCategory?: WriteCategory;
  onCategoryChange?: (cat: WriteCategory) => void;
  tags?: string[];
  tagInput?: string;
  onTagInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag?: (tag: string) => void;
}

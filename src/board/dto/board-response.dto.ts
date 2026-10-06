// @role: entities/dto

export interface PaginationDto {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface BoardListItemDto {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  imageUrl: string | null;
  commentCount: number;
  tags: string[];
  liked: number;
}

export interface BoardListResponseDto {
  items: BoardListItemDto[];
  pagination: PaginationDto;
}

export interface CommentDto {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId: number | null;
  liked: number;
}

export interface BoardDetailFreeDto {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageUrl: string | null;
  tags: string[];
  comments: CommentDto[];
}

export interface BoardDetailNoticeDto {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageUrl: string | null;
}

export interface BoardDetailEventDto {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageUrl: string | null;
}

export interface BoardDetailReviewDto {
  id: number;
  title: string;
  content: string;
  author: string;
  rating: number;
  createdAt: string;
  imageUrl: string | null;
  tags: string[];
}

export type BoardDetailDto =
  | BoardDetailFreeDto
  | BoardDetailNoticeDto
  | BoardDetailEventDto
  | BoardDetailReviewDto;

export interface CreateBoardResponseDto {
  id: number;
}

export interface MessageResponseDto {
  message: string;
}

export interface Comment {
  id: string;
  uid: string;
  author: string;
  content: string;
  createdAt: number;
  parentId: string | null; // null = 댓글, commentId = 대댓글
}

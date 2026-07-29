/**
 * @role: widgets — 댓글 섹션 UI
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import { Comment } from '@/entities/Board/types/commentType';
import { useComments } from '@/features/Board/hooks/useComments';
import { useCreateComment } from '@/features/Board/hooks/useCreateComment';
import { useDeleteComment } from '@/features/Board/hooks/useDeleteComment';
import { useUpdateComment } from '@/features/Board/hooks/useUpdateComment';
import { useLikeComment } from '@/features/Board/hooks/useLikeComment';
import { auth } from '@/shared/firebase/firebase';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { formatBoardTime } from '@/shared/lib/formatDate';
import { getProfileColor } from '@/shared/lib/profileColor';
import { useRef, useState } from 'react';

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

interface Props {
  postDocId: string;
  boardType?: string;
  isPC?: boolean;
}

const Avatar = ({ name }: { name: string }) => (
  <div
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
    style={{ backgroundColor: getProfileColor(name) }}
  >
    {name?.charAt(0) ?? '?'}
  </div>
);

const CommentItem = ({
  comment,
  allComments,
  boardType,
  postDocId,
  isLiked,
  likesCount,
  onLike,
  onRefresh,
}: {
  comment: Comment;
  allComments: Comment[];
  boardType: string;
  postDocId: string;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  onRefresh: () => void;
}) => {
  const currentUid = auth.currentUser?.uid;
  const isOwner = currentUid === comment.uid;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyValue, setReplyValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const replySubmittingRef = useRef(false);

  const { updateComment } = useUpdateComment(boardType, postDocId, onRefresh);
  const { deleteComment } = useDeleteComment(boardType, postDocId, onRefresh);
  const { createComment } = useCreateComment(boardType, postDocId, onRefresh);

  const replies = allComments.filter((c) => c.parentId === comment.id);

  const handleEdit = async () => {
    await updateComment(comment.id, editValue);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    await deleteComment(comment.id);
  };

  const handleReplySubmit = async () => {
    if (!replyValue.trim() || replySubmittingRef.current) return;
    replySubmittingRef.current = true;
    await createComment(replyValue, comment.id);
    setReplyValue('');
    setShowReplyInput(false);
    replySubmittingRef.current = false;
  };

  return (
    <div>
      {/* 댓글 */}
      <div className="flex gap-3 px-4 py-3">
        <Avatar name={comment.author} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {comment.author}
              </span>
              <span className="text-xs text-gray-400">
                {formatBoardTime(comment.createdAt)}
              </span>
            </div>
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-6 w-6 items-center justify-center text-gray-400"
                >
                  ···
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-7 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDelete}
                        className="text-red-500 hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1 flex gap-2">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={handleEdit}
                className="text-xs font-semibold text-blue"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-400"
              >
                취소
              </button>
            </div>
          ) : (
            <p className="mt-0.5 text-sm text-gray-800">{comment.content}</p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isLiked ? 'text-blue' : 'text-gray-400 hover:text-blue'}`}
            >
              <HeartIcon filled={isLiked} />
              <span>{likesCount > 0 ? likesCount : '좋아요'}</span>
            </button>
            {!!localStorage.getItem('access_token') && (
              <button
                onClick={() => setShowReplyInput((v) => !v)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                답글 달기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 대댓글 목록 */}
      {replies.length > 0 && (
        <div className="ml-11 border-l-2 border-gray-100">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              boardType={boardType}
              postDocId={postDocId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* 대댓글 입력 */}
      {showReplyInput && (
        <div className="ml-11 flex items-center gap-2 border-l-2 border-gray-100 py-2 pl-3 pr-4">
          <Avatar name="?" />
          <input
            value={replyValue}
            onChange={(e) => setReplyValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleReplySubmit();
              }
            }}
            placeholder="답글을 입력하세요"
            className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={handleReplySubmit}
            className="shrink-0 text-xs font-bold text-blue"
          >
            등록
          </button>
        </div>
      )}
    </div>
  );
};

const ReplyItem = ({
  reply,
  boardType,
  postDocId,
  onRefresh,
}: {
  reply: Comment;
  boardType: string;
  postDocId: string;
  onRefresh: () => void;
}) => {
  const currentUid = auth.currentUser?.uid;
  const isOwner = currentUid === reply.uid;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(reply.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const { updateComment } = useUpdateComment(boardType, postDocId, onRefresh);
  const { deleteComment: deleteReply } = useDeleteComment(
    boardType,
    postDocId,
    onRefresh,
  );

  const handleEdit = async () => {
    await updateComment(reply.id, editValue);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3 py-2.5 pl-3 pr-4">
      <Avatar name={reply.author} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {reply.author}
            </span>
            <span className="text-xs text-gray-400">
              {formatBoardTime(reply.createdAt)}
            </span>
          </div>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-6 w-6 items-center justify-center text-gray-400"
              >
                ···
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-7 z-20 min-w-[80px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        deleteReply(reply.id);
                      }}
                      className="text-red-500 hover:bg-red-50 block w-full px-4 py-2.5 text-left text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1 flex gap-2">
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm outline-none"
            />
            <button
              onClick={handleEdit}
              className="text-xs font-semibold text-blue"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-gray-400"
            >
              취소
            </button>
          </div>
        ) : (
          <p className="mt-0.5 text-sm text-gray-800">{reply.content}</p>
        )}
      </div>
    </div>
  );
};

export const CommentSection = ({
  postDocId,
  boardType = 'board',
  isPC = false,
}: Props) => {
  const { isLoggedIn, user: currentUser } = useCurrentUser();
  const { comments, isLoaded, refresh } = useComments(boardType, postDocId);
  const { createComment } = useCreateComment(boardType, postDocId, refresh);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const topLevelComments = comments.filter((c) => c.parentId === null);
  const { likedMap, likesMap, handleClickLike } = useLikeComment(
    topLevelComments.map((c) => c.id),
  );

  const handleSubmit = async () => {
    if (!input.trim() || submittingRef.current) return;
    submittingRef.current = true;
    await createComment(input, null);
    setInput('');
    inputRef.current?.blur();
    submittingRef.current = false;
  };

  return (
    <div className="flex flex-col">
      {/* 댓글 헤더 */}
      <div className="bg-white px-4 py-3">
        <span className="text-md font-bold text-gray-900">
          댓글 <span className="text-blue">{topLevelComments.length}</span>
        </span>
      </div>

      {/* 댓글 목록 */}
      <div className={`bg-white ${isPC ? '' : 'pb-[140px]'}`}>
        {!isLoaded ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-4">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))
        ) : topLevelComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <span className="text-2xl">💬</span>
            <span className="mt-2 text-sm font-semibold">
              첫 댓글을 남겨보세요
            </span>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                allComments={comments}
                boardType={boardType}
                postDocId={postDocId}
                isLiked={likedMap[comment.id] ?? false}
                likesCount={likesMap[comment.id] ?? 0}
                onLike={() => handleClickLike(comment.id)}
                onRefresh={refresh}
              />
            </div>
          ))
        )}
      </div>

      {/* 댓글 입력 */}
      {isLoggedIn ? (
        <div
          className={`flex items-center gap-3 bg-white px-4 py-3 ${isPC ? '' : 'fixed bottom-20 left-1/2 w-[375px] -translate-x-1/2'}`}
        >
          <Avatar name={currentUser?.name ?? '?'} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-md bg-gray-100 px-4 py-2.5 text-sm outline-none"
          />
          <button
            onClick={handleSubmit}
            className="shrink-0 rounded-md bg-blue px-6 py-2 text-sm font-bold text-white disabled:opacity-40"
            disabled={!input.trim()}
          >
            등록
          </button>
        </div>
      ) : (
        <div
          className={`relative overflow-hidden bg-white px-4 py-3 ${isPC ? '' : 'fixed bottom-20 left-1/2 w-[375px] -translate-x-1/2'}`}
        >
          <div className="pointer-events-none flex select-none items-center gap-3 blur-sm">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 rounded-md bg-gray-100 px-4 py-2.5 text-sm text-gray-300">
              댓글을 입력하세요
            </div>
            <div className="shrink-0 rounded-md bg-gray-300 px-6 py-2 text-sm font-bold text-white">
              등록
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs font-bold text-gray-700">
              로그인 후 댓글을 작성할 수 있어요
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

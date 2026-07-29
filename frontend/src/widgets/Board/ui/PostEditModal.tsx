import { BoardPost } from '@/entities/Board/types/boardType';
import { useState } from 'react';

interface Props {
  post: BoardPost;
  onSave: (title: string, content: string) => Promise<void>;
  onClose: () => void;
}

export const PostEditModal = ({ post, onSave, onClose }: Props) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await onSave(title, content);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-8 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <h2 className="mb-4 text-base font-bold">게시물 수정</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm outline-none"
          placeholder="제목"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="mb-4 w-full resize-none rounded-xl bg-gray-100 px-4 py-2.5 text-sm outline-none"
          placeholder="내용"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-gray-100 py-3.5 text-base font-bold text-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-2xl bg-blue py-3.5 text-base font-bold text-white disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

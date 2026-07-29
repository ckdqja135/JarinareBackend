/**
 * @role: features — 자유게시판 글 작성 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당, UI 로직 포함 금지
 */
import { useRef, useState } from 'react';
import { useCreateBoard } from './useCreateBoard';
import { useUpdatePost } from './useUpdatePost';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '@/shared/supabase/supabase';
import { auth } from '@/shared/firebase/firebase';
import { BoardPost } from '@/entities/Board/types/boardType';

export const useBaordHandler = (options?: {
  onAfterCreate?: (
    posterUid: string,
    posterName: string,
    postDocId: string,
  ) => void;
  navigateTo?: string;
}) => {
  const location = useLocation();
  const editPost = location.state?.editPost as BoardPost | undefined;
  const isEditMode = !!editPost;

  const [author, setAuthor] = useState<string>(editPost?.author ?? '');
  const [title, setTitle] = useState<string>(editPost?.title ?? '');
  const [content, setContent] = useState<string>(editPost?.content ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(editPost?.tags ?? []);
  const [tagInput, setTagInput] = useState<string>('');

  const navigate = useNavigate();
  const { createBoard } = useCreateBoard();
  const { updatePost } = useUpdatePost();
  const user = auth.currentUser;

  const onAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const onTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const onAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const onTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onAddTag();
    }
  };

  const onRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onloadend = () => {
        setPreviewImg(reader.result as string);
      };
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && editPost) {
        await updatePost('board', editPost.id, { title, content, tags });
      } else {
        const boardId = await createBoard(title, content, tags);
        if (file && boardId) {
          const filePath = `board/${boardId}/${file.name}`;
          const { error } = await supabase.storage
            .from('jarinare-images')
            .upload(filePath, file);
          if (error) {
            console.error('업로드 오류:', error);
            alert('이미지 업로드 실패. 콘솔을 확인하세요.');
            return;
          }
          const { data: urlData } = supabase.storage
            .from('jarinare-images')
            .getPublicUrl(filePath);
          await updatePost('board', boardId, { title, content, tags, imageUrl: urlData.publicUrl });
        }
        if (user && boardId) {
          options?.onAfterCreate?.(
            user.uid,
            user.displayName ?? user.uid,
            boardId,
          );
        }
      }
      navigate(options?.navigateTo ?? '/board');
    } catch (err) {
      console.error('오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    onAuthorChange,
    onTitleChange,
    onContentChange,
    onFileChange,
    onSubmit,
    setFile,
    setPreviewImg,
    file,
    fileInputRef,
    author,
    title,
    content,
    previewImg,
    loading,
    tags,
    tagInput,
    onTagInputChange,
    onTagInputKeyDown,
    onAddTag,
    onRemoveTag,
    isEditMode,
  };
};

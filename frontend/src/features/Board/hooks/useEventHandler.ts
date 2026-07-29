/**
 * @role: features — 이벤트 글 작성 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당, UI 로직 포함 금지
 */
import { useRef, useState } from 'react';
import { useCreateEvent } from './useCreateEvent';
import { useUpdatePost } from './useUpdatePost';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '@/shared/supabase/supabase';
import { BoardPost } from '@/entities/Board/types/boardType';

export const useEventHandler = (options?: { navigateTo?: string }) => {
  const location = useLocation();
  const editPost = location.state?.editPost as BoardPost | undefined;
  const isEditMode = !!editPost;

  const [author, setAuthor] = useState(editPost?.author ?? '');
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { createEvent } = useCreateEvent();
  const { updatePost } = useUpdatePost();

  const onAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
        await updatePost('event', editPost.id, { title, content });
      } else {
        const eventId = await createEvent(title, content);
        if (file && eventId) {
          const filePath = `event/${eventId}/${file.name}`;
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
          await updatePost('event', eventId, { title, content, imageUrl: urlData.publicUrl });
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
    isEditMode,
  };
};

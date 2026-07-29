/**
 * @role: pages — PC 여행지 후기 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useUpdateTravelReview } from '@/features/TravelReview/hooks/useUpdateTravelReview';
import { useDeleteTravelReview } from '@/features/TravelReview/hooks/useDeleteTravelReview';
import { useCreateTravelReview } from '@/features/TravelReview/hooks/useCreateTravelReview';
import type { TravelReview } from '@/entities/TravelReview/types/travelReviewType';
import type { SortOption } from '../types/travelReviewPageType';

export type { SortOption };

export const usePCTravelReviewPage = (
  city: string,
  reviews: TravelReview[],
) => {
  const navigate = useNavigate();
  const { updateReview } = useUpdateTravelReview(city);
  const { deleteReview } = useDeleteTravelReview(city);
  const { createReview } = useCreateTravelReview(city);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('최신순');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeRating, setWriteRating] = useState(5);
  const [writeFile, setWriteFile] = useState<File | null>(null);
  const [writePreviewImg, setWritePreviewImg] = useState<string | null>(null);
  const writeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleEditStart = (
    id: string,
    title: string,
    content: string,
    rating: number,
  ) => {
    setEditingId(id);
    setEditTitle(title);
    setEditContent(content);
    setEditRating(rating);
  };

  const handleEditSave = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    await updateReview(
      editingId,
      editTitle.trim(),
      editContent.trim(),
      editRating,
    );
    setSaving(false);
    setEditingId(null);
    navigate(0);
  };

  const handleDelete = async (id: string) => {
    await deleteReview(id);
    navigate(0);
  };

  const onWriteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWriteFile(e.target.files[0]);
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onloadend = () => setWritePreviewImg(reader.result as string);
    }
  };

  const handleWriteSubmit = async () => {
    if (!writeTitle.trim() || !writeContent.trim()) return;
    setSubmitting(true);
    await createReview(
      writeTitle.trim(),
      writeContent.trim(),
      writeRating,
      writeFile,
    );
    setSubmitting(false);
    setShowWriteForm(false);
    setWriteTitle('');
    setWriteContent('');
    setWriteRating(5);
    setWriteFile(null);
    setWritePreviewImg(null);
    if (writeFileInputRef.current) writeFileInputRef.current.value = '';
    navigate(0);
  };

  const sortReviews = (reviews: TravelReview[]) => {
    if (sortOption === '별점순')
      return [...reviews].sort((a, b) => b.rating - a.rating);
    return [...reviews].sort((a, b) => b.createdAt - a.createdAt);
  };

  const filterReviews = (reviews: TravelReview[]) => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q),
    );
  };

  const processedReviews = sortReviews(filterReviews(reviews));

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
    pct:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === n).length / reviews.length) * 100
        : 0,
  }));

  return {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editRating,
    setEditRating,
    saving,
    handleEditStart,
    handleEditSave,
    handleDelete,
    showWriteForm,
    setShowWriteForm,
    writeTitle,
    setWriteTitle,
    writeContent,
    setWriteContent,
    writeRating,
    setWriteRating,
    writePreviewImg,
    setWriteFile,
    setWritePreviewImg,
    writeFileInputRef,
    onWriteFileChange,
    submitting,
    handleWriteSubmit,
    processedReviews,
    ratingCounts,
    isLoggedIn: !!localStorage.getItem(ACCESS_TOKEN_KEY),
  };
};

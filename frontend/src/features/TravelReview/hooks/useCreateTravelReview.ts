/**
 * @role: features — 여행지 후기 작성
 * @rule: api/ 호출만 담당, Firestore 직접 호출 금지
 */
import { backendClient } from '@/shared/api/backendClient';
import supabase from '@/shared/supabase/supabase';

export const useCreateTravelReview = (_destination: string) => {
  const createReview = async (
    title: string,
    content: string,
    rating: number,
    file?: File | null,
  ) => {
    // 1. 후기 생성 (ID 확보)
    const { data: review } = await backendClient.post<{ id: string }>(
      '/api/travel-reviews',
      { title, content, rating },
    );

    // 2. 이미지 있으면 Supabase 업로드 후 imageUrl 업데이트
    if (file) {
      const filePath = `travel-review/${review.id}/${file.name}`;
      const { error } = await supabase.storage
        .from('jarinare-images')
        .upload(filePath, file);

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('jarinare-images')
          .getPublicUrl(filePath);

        await backendClient.patch(`/api/travel-reviews/${review.id}`, {
          imageUrl: urlData.publicUrl,
        });
      }
    }
  };

  return { createReview };
};

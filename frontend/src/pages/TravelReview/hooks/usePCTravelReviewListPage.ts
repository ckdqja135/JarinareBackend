/**
 * @role: pages — PC 여행지 후기 목록 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useDestinationRatings } from '@/features/TravelReview/hooks/useDestinationRatings';
import { useSearchByStation } from '@/features/TravelReview/hooks/useSearchByStation';
import { usePagination } from '@/features/TravelReview/hooks/usePagination';
import { useCreateTravelReview } from '@/features/TravelReview/hooks/useCreateTravelReview';
import { getAllStations } from '@/shared/lib/trainRoutes';
import type { DestinationReviewSummary } from '@/entities/TravelReview/types/travelReviewType';

const PAGE_SIZE = 9;

export const usePCTravelReviewListPage = () => {
  const navigate = useNavigate();
  const { summaries, isLoaded } = useDestinationRatings();
  const allStations = getAllStations();

  const [searchQuery, setSearchQuery] = useState('');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeRating, setWriteRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const { createReview } = useCreateTravelReview(selectedCity);
  const { results } = useSearchByStation(searchQuery, summaries);

  const { paged, page, totalPages, goNext, goPrev, goToPage } = usePagination(
    results,
    PAGE_SIZE,
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const filteredStations = useMemo(
    () =>
      citySearch.trim()
        ? allStations.filter((s) => s.includes(citySearch.trim()))
        : allStations,
    [allStations, citySearch],
  );

  const handleWriteSubmit = async () => {
    if (!selectedCity || !writeTitle.trim() || !writeContent.trim()) return;
    setSubmitting(true);
    await createReview(writeTitle.trim(), writeContent.trim(), writeRating);
    setSubmitting(false);
    setShowWriteForm(false);
    setSelectedCity('');
    setCitySearch('');
    setWriteTitle('');
    setWriteContent('');
    setWriteRating(5);
    navigate(0);
  };

  return {
    isLoaded,
    searchQuery,
    setSearchQuery,
    paged: paged as DestinationReviewSummary[],
    page,
    totalPages,
    pageNumbers,
    goNext,
    goPrev,
    goToPage,
    totalCount: results.length,
    showWriteForm,
    setShowWriteForm,
    selectedCity,
    setSelectedCity,
    citySearch,
    setCitySearch,
    writeTitle,
    setWriteTitle,
    writeContent,
    setWriteContent,
    writeRating,
    setWriteRating,
    submitting,
    handleWriteSubmit,
    filteredStations,
    isLoggedIn: !!localStorage.getItem(ACCESS_TOKEN_KEY),
  };
};

export interface TravelReview {
  id: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  createdAt: number;
  updatedAt?: number;
  imageUrl?: string | null;
}

export interface DestinationReviewSummary {
  city: string;
  averageRating: number;
  reviewCount: number;
}

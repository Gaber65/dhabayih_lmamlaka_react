export interface ProductReview {
  id: string;
  authorName: string;
  city?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  cuttingRating?: number;
  packagingRating?: number;
  deliveryRating?: number;
  likesCount?: number;
}

export interface RatingBreakdown {
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

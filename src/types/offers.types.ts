export interface Coupon {
  id?: string;
  code: string;
  title: string;
  titleAr?: string;
  description: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountPercentage?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  expiresAt?: string;
  isFeatured?: boolean;
  isExclusive?: boolean;
}


export interface FlashDeal {
  id: number;
  productId: number;
  productName: string;
  productNameAr?: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  endsAt: string; // ISO date string
  soldPercentage: number;
  remainingStock: number;
}

export interface MeatBundle {
  id: number;
  title: string;
  titleAr?: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  savings: number;
  imageUrl: string;
  items: string[];
  tag: string;
}

export interface ProductOption {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price?: number;
  description?: string;
}

export interface WeightOption {
  id: number;
  label: string;
  labelAr?: string;
  labelEn?: string;
  weightKg: number;
  price: number;
  originalPrice?: number;
  isDefault?: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  longDescription?: string;
  categoryId?: number;
  categoryName?: string;
  weight?: string;
  weightOptions?: WeightOption[];
  price: number;
  sellingPrice?: number;
  offerPrice?: number;
  originalPrice?: number;
  isOnOffer?: boolean;
  imageUrl: string;
  images?: string[];
  mainImageUrl?: string;
  discountTag?: string;
  discountPercentage?: number;
  isOffer?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isAvailable?: boolean;
  stockQuantity?: number;
  loyaltyPoints?: number;
  rating?: number;
  reviewsCount?: number;
  origin?: string; // e.g. 'بلدي محلي - مزارع القصيم والخرج'
  slaughterMethod?: string; // e.g. 'ذبح حلال يدوي بإشراف بيطري معتمد'
  preparationTime?: string; // e.g. '2 - 4 ساعات'
  specifications?: ProductSpecification[];
  cuttingOptions?: ProductOption[];
  packagingOptions?: ProductOption[];
  excludedParts?: ProductOption[];
}

export interface Category {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  imageUrl: string;
  bannerUrl?: string;
  description?: string;
  productCount?: number;
  isPopular?: boolean;
  subcategories?: { id: number; name: string; nameAr?: string; nameEn?: string; count?: number }[];
}
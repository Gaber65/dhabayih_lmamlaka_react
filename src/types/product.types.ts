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
  stock?: number;
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
  sizes?: ProductSize[];
  hasSizes?: boolean;
  has_sizes?: boolean;
  calories?: number;
  isCarcass?: boolean;
  is_carcass?: boolean;
  portions?: ProductPortion[];
}

export interface ProductPortion {
  type: string;
  name: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  image_url?: string;
  startingPrice: number;
  starting_price?: number;
  sizeCount?: number;
  size_count?: number;
}

export interface ProductSize {
  id: number;
  name: string;
  subTitle?: string;
  sub_title?: string;
  portionType?: string;
  portion_type?: string;
  weightRange?: string;
  weight_range?: string;
  minWeight?: number;
  min_weight?: number;
  maxWeight?: number;
  max_weight?: number;
  price: number;
  originalPrice?: number;
  offerPrice?: number;
  calories?: number;
  loyaltyPoints?: number;
  loyalty_points?: number;
  pointsPrice?: number;
  points_price?: number;
  isDefault?: boolean;
  is_default?: boolean;
  sequence?: number;
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
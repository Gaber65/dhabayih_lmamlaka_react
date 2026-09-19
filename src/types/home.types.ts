import { Product, Category } from './product.types';

export interface Offer {
  id: number;
  name: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
  badge_text?: string;
  discountType?: 'percentage' | 'fixed';
  discount_type?: 'percentage' | 'fixed';
  discountValue?: number;
  discount_value?: number;
  bannerImageUrl?: string;
  banner_image_url?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  isActive?: boolean;
  is_active?: boolean;
  productsCount?: number;
  products_count?: number;
  products?: Product[];
}

export interface Banner {
  id: number;
  name: string;
  imageUrl: string;
  linkUrl?: string;
  bannerType?: 'offer' | 'category' | 'product' | 'custom';
  banner_type?: 'offer' | 'category' | 'product' | 'custom';
  offerId?: number;
  offer_id?: number;
  deepLink?: string;
  deep_link?: string;
}

export interface HighlightStory {
  id: number;
  name: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
}

export interface JabinHighlight {
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
  };
  highlights: HighlightStory[];
}

export interface UserHighlight {
  id: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
  balance: number;
  activeCart?: {
    id: number;
    status: string;
    lineCount: number;
  };
}

export interface HomeData {
  deliveryLocation?: string;
  userHighlight?: UserHighlight;
  banners: Banner[];
  offers?: Offer[];
  categories: Category[];
  featuredProducts: Product[];
  bestSellers: Product[];
  recommendedProducts: Product[];
  jabinHighlight: JabinHighlight[];
}
import { apiClient } from './client';
import { Offer } from '../types/home.types';
import { Product } from '../types/product.types';

const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '';
  let cleanUrl = url.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):8069/i, '');
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
  if (!cleanUrl.startsWith('/')) cleanUrl = `/${cleanUrl}`;
  return cleanUrl;
};

const mapProduct = (item: any): Product => {
  const selling = Number(item.selling_price ?? item.price ?? 0);
  const offer = Number(item.offer_price ?? 0);
  const isOnOffer = Boolean(item.is_on_offer || (offer > 0 && offer < selling));

  return {
    id: item.id,
    name: item.name || '',
    nameAr: item.name_ar,
    nameEn: item.name_en,
    description: item.description || '',
    categoryId: item.category_id ? Number(item.category_id) : undefined,
    categoryName: item.category_name,
    weight: item.weight ? String(item.weight) : '',
    price: selling,
    offerPrice: offer > 0 ? offer : undefined,
    isOnOffer,
    discountTag: item.discount_percentage ? `خصم ${item.discount_percentage}%` : (isOnOffer ? 'عرض خاص' : undefined),
    isAvailable: item.is_available ?? (item.stock_quantity > 0),
    stock: item.stock_quantity ?? 0,
    imageUrl: normalizeImageUrl(item.image_url || item.image),
  };
};

const mapOffer = (item: any): Offer => {
  return {
    id: item.id,
    name: item.name || '',
    subtitle: item.subtitle || '',
    description: item.description || '',
    badgeText: item.badge_text || '',
    discountType: item.discount_type || 'percentage',
    discountValue: Number(item.discount_value || 0),
    bannerImageUrl: normalizeImageUrl(item.banner_image_url || item.banner_image),
    startDate: item.start_date,
    endDate: item.end_date,
    isActive: item.is_active ?? true,
    productsCount: item.products_count ?? (item.products ? item.products.length : 0),
    products: Array.isArray(item.products) ? item.products.map(mapProduct) : [],
  };
};

export const offersApi = {
  getOffers: async (): Promise<Offer[]> => {
    try {
      const response = await apiClient.get<any>('/api/v1/offers');
      const data = response.data?.data?.offers || response.data?.offers || [];
      return Array.isArray(data) ? data.map(mapOffer) : [];
    } catch (err) {
      console.warn('Failed to load offers from server, using fallback', err);
      return [
        {
          id: 1,
          name: 'عروض ذبائح العيد الكبرى',
          subtitle: 'خصم خاص 15% على جميع ذبائح النعيمي والحري وبوكسات التوفير',
          badgeText: 'خصم 15%',
          discountType: 'percentage',
          discountValue: 15,
          bannerImageUrl: '/images/onboarding/livestock.jpg',
          productsCount: 3,
        }
      ];
    }
  },

  getOfferById: async (offerId: number): Promise<Offer | null> => {
    try {
      const response = await apiClient.get<any>(`/api/v1/offers/${offerId}`);
      const data = response.data?.data || response.data;
      return data ? mapOffer(data) : null;
    } catch (err) {
      console.error(`Failed to load offer ${offerId}:`, err);
      return null;
    }
  },
};
